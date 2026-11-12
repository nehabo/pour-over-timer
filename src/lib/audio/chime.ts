export interface ChimeHandle {
  /** Silence the chime if it hasn't finished. Safe to call more than once. */
  cancel(): void;
}

const NOTES = [
  { freq: 880, offset: 0 }, // A5
  { freq: 1318.5, offset: 0.28 }, // E6
];
const NOTE_LENGTH = 0.32; // seconds; the whole chime is about 0.6 s
const LEVEL = 0.25; // fixed, independent of the ambient volume slider

/**
 * Schedule the two-note chime at `at` (AudioContext time, seconds).
 * It has its own gain node straight to the destination, so it plays even when ambient sound is Off.
 * Scheduling on the audio clock means it fires on time even if a background tab throttles JS timers.
 */
export function scheduleChime(ctx: AudioContext, at: number): ChimeHandle {
  const out = ctx.createGain();
  out.gain.value = LEVEL;
  out.connect(ctx.destination);

  const oscillators = NOTES.map(({ freq, offset }) => {
    const t0 = at + offset;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const env = ctx.createGain();
    env.gain.value = 0;
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(1, t0 + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, t0 + NOTE_LENGTH);

    osc.connect(env).connect(out);
    osc.start(t0);
    osc.stop(t0 + NOTE_LENGTH + 0.02);
    return osc;
  });

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    out.disconnect();
  };
  oscillators[oscillators.length - 1].onended = finish;

  return {
    cancel() {
      if (done) return;
      for (const osc of oscillators) {
        osc.onended = null;
        try {
          osc.stop();
        } catch {
          // already stopped
        }
      }
      finish();
    },
  };
}

/** Play the chime right away. */
export function playChime(ctx: AudioContext): ChimeHandle {
  return scheduleChime(ctx, ctx.currentTime + 0.05);
}
