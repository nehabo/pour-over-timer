import { ensureAudio, getAudio, setAmbient, setVolume } from './audio/engine';
import { playChime, scheduleChime, type ChimeHandle } from './audio/chime';
import { formatMs } from './format';
import { durationsFor, TITLE_LABEL, type Durations, type Phase, type PresetId } from './presets';
import { settings } from './settings.svelte';

export type { Phase };
export type Status = 'idle' | 'running' | 'paused';

const TICK_MS = 250;
const MINUTE = 60_000;
/** A long break replaces the short break after every Nth focus session. */
export const LONG_BREAK_EVERY = 4;

/**
 * The single timer store. The main page and the PiP window both read it, and UI
 * components only call its actions; they never own timer logic.
 *
 * It stores the moment the phase should end (endTime), not a countdown, so throttled
 * background tabs can't make it drift: remaining = endTime - now.
 */
export class Timer {
  phase = $state<Phase>('focus');
  status = $state<Status>('idle');
  /** Epoch ms when the current phase ends; set only while running. */
  endTime = $state<number | null>(null);
  /** Phase lengths in minutes, starting from the saved preset. */
  durations = $state<Durations>(durationsFor(settings.preset, settings.custom));
  /** Ms left while paused or idle. */
  pausedRemaining = $state(this.durations.focus * MINUTE);
  /** Focus sessions finished in this cycle (0..LONG_BREAK_EVERY). */
  completedFocus = $state(0);
  /** Updated by the ticker; drives the derived values. */
  now = $state(Date.now());

  phaseDurationMs = $derived(this.durations[this.phase] * MINUTE);
  remaining = $derived(
    this.status === 'running' && this.endTime !== null
      ? Math.max(0, this.endTime - this.now)
      : this.pausedRemaining,
  );
  progress = $derived(this.phaseDurationMs > 0 ? 1 - this.remaining / this.phaseDurationMs : 0);
  minutesLeft = $derived(Math.ceil(this.remaining / MINUTE));

  #interval: ReturnType<typeof setInterval> | null = null;
  #chime: ChimeHandle | null = null;

  start = () => {
    if (this.status === 'running') return;
    const t = Date.now();
    this.now = t;
    this.endTime = t + this.pausedRemaining;
    this.status = 'running';
    this.#startTicker();

    // Called from the Start click, so this is where the AudioContext gets created.
    const ctx = ensureAudio();
    if (ctx) this.#chime = scheduleChime(ctx, ctx.currentTime + this.pausedRemaining / 1000);
  };

  pause = () => {
    if (this.status !== 'running' || this.endTime === null) return;
    const t = Date.now();
    this.pausedRemaining = Math.max(0, this.endTime - t);
    this.endTime = null;
    this.now = t;
    this.status = 'paused';
    this.#stopTicker();
    this.#cancelChime();
  };

  toggle = () => {
    if (this.status === 'running') this.pause();
    else this.start();
  };

  reset = () => {
    this.#stopTicker();
    this.#cancelChime();
    this.endTime = null;
    this.status = 'idle';
    this.pausedRemaining = this.phaseDurationMs;
  };

  /** End the current phase now and move to the next one, without a chime. */
  skip = () => {
    this.#cancelChime();
    this.#advance();
  };

  /** Change phase lengths. Ignored while running; resets the current phase to its new length. */
  setDurations = (durations: Durations): boolean => {
    if (this.status === 'running') return false;
    this.durations = { ...durations };
    this.reset();
    return true;
  };

  /** Pick a preset (or 'custom', which uses the saved custom values). Ignored while running. */
  setPreset = (preset: PresetId): boolean => {
    if (!this.setDurations(durationsFor(preset, settings.custom))) return false;
    settings.preset = preset;
    return true;
  };

  /** Set and select custom durations (already validated with clampCustom). Ignored while running. */
  setCustom = (custom: Durations): boolean => {
    if (!this.setDurations(custom)) return false;
    settings.custom = { ...custom };
    settings.preset = 'custom';
    return true;
  };

  /** Refresh `now`; finish the phase if time is up. */
  tick = () => {
    this.now = Date.now();
    if (this.status === 'running' && this.endTime !== null && this.now >= this.endTime) {
      this.#complete();
    }
  };

  #complete() {
    if (this.#chime) {
      // Already scheduled on the audio clock: it has played or is about to. Leave it be.
      this.#chime = null;
    } else {
      const ctx = getAudio();
      if (ctx) playChime(ctx);
    }
    this.#advance();
  }

  #advance() {
    this.#stopTicker();
    if (this.phase === 'focus') {
      this.completedFocus += 1;
      this.phase = this.completedFocus % LONG_BREAK_EVERY === 0 ? 'longBreak' : 'shortBreak';
    } else {
      if (this.phase === 'longBreak') this.completedFocus = 0;
      this.phase = 'focus';
    }
    this.endTime = null;
    this.status = 'idle';
    this.pausedRemaining = this.durations[this.phase] * MINUTE;
  }

  #startTicker() {
    this.#stopTicker();
    this.#interval = setInterval(this.tick, TICK_MS);
  }

  #stopTicker() {
    if (this.#interval !== null) clearInterval(this.#interval);
    this.#interval = null;
  }

  #cancelChime() {
    this.#chime?.cancel();
    this.#chime = null;
  }
}

export const timer = new Timer();

/**
 * Browser-only wiring: refresh on tab return, show the time in the tab title,
 * and keep the ambient sound in step with the timer (it plays only during a running focus phase).
 * Called once from main.ts (kept out of the constructor so unit tests stay DOM-free).
 */
export function initTimerEffects(): () => void {
  const baseTitle = document.title; // "Pour Over", from index.html
  const onVisibility = () => timer.tick();
  document.addEventListener('visibilitychange', onVisibility);

  const stopEffects = $effect.root(() => {
    $effect(() => {
      document.title =
        timer.status === 'running'
          ? `${formatMs(timer.remaining)} · ${TITLE_LABEL[timer.phase]}`
          : baseTitle;
    });

    $effect(() => {
      const active = timer.phase === 'focus' && timer.status === 'running';
      setAmbient(active ? settings.sound : null);
    });

    $effect(() => {
      setVolume(settings.volume);
    });
  });

  return () => {
    document.removeEventListener('visibilitychange', onVisibility);
    stopEffects();
  };
}
