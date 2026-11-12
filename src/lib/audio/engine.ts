import { createVoice, type NoiseKind, type Voice } from './noise';

const FADE_IN = 1.5; // seconds
const FADE_OUT = 1.0;
const VOLUME_RAMP = 0.05;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let current: Voice | null = null;
let volume = 0.6; // 0..1, kept so the master gain starts at the saved level

/** Slider position (0..1) -> gain. Squared so the slider feels even across its range. */
function volumeToGain(v: number): number {
  return v * v;
}

/**
 * Returns the shared AudioContext, creating it on first call.
 * Call this from a user gesture (the Start click): browsers block audio before one.
 * Returns null where Web Audio isn't available (e.g. unit tests).
 */
export function ensureAudio(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = volumeToGain(volume);
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** The AudioContext if one already exists; never creates one. */
export function getAudio(): AudioContext | null {
  return ctx;
}

/** Ramp a gain from wherever it is right now, never jumping (jumps click). */
function rampTo(param: AudioParam, value: number, seconds: number) {
  const t = ctx!.currentTime;
  if (typeof param.cancelAndHoldAtTime === 'function') {
    param.cancelAndHoldAtTime(t);
  } else {
    param.cancelScheduledValues(t);
    param.setValueAtTime(param.value, t);
  }
  param.linearRampToValueAtTime(value, t + seconds);
}

/**
 * Make the ambient sound match what should be playing.
 * `kind` null (or 'off') fades the current sound out. A different kind crossfades:
 * the old sound fades out over 1 s while the new one fades in over 1.5 s.
 * Asking for the sound that's already playing does nothing.
 */
export function setAmbient(kind: NoiseKind | 'off' | null): void {
  if (!ctx || !master) return;
  const target = kind === 'off' ? null : kind;
  if (current?.kind === target) return;

  if (current) {
    rampTo(current.gain.gain, 0, FADE_OUT);
    current.stop(ctx.currentTime + FADE_OUT + 0.05);
    current = null;
  }
  if (target) {
    current = createVoice(ctx, target, master);
    rampTo(current.gain.gain, 1, FADE_IN);
  }
}

/** Set the ambient volume (0–100), applied live. */
export function setVolume(percent: number): void {
  volume = Math.min(100, Math.max(0, percent)) / 100;
  if (ctx && master) rampTo(master.gain, volumeToGain(volume), VOLUME_RAMP);
}
