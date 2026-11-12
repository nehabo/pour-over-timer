let ctx: AudioContext | null = null;

/**
 * Returns the shared AudioContext, creating it on first call.
 * Call this from a user gesture (the Start click): browsers block audio before one.
 * Returns null where Web Audio isn't available (e.g. unit tests).
 */
export function ensureAudio(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** The AudioContext if one already exists; never creates one. */
export function getAudio(): AudioContext | null {
  return ctx;
}
