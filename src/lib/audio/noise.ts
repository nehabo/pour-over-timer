export type NoiseKind = 'white' | 'pink' | 'brown' | 'rain';

const LOOP_SECONDS = 2;
/** Overlap blended across the loop point so it repeats without a click. */
const SEAM_SECONDS = 0.05;
/** Target loudness (RMS) for every buffer, so switching sounds doesn't jump in level. */
const TARGET_RMS = 0.18;

type Generator = (n: number) => Float32Array;

function white(n: number): Float32Array {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = Math.random() * 2 - 1;
  return out;
}

/** Paul Kellet's refined pink-noise filter: softer, more natural than white. */
function pink(n: number): Float32Array {
  const out = new Float32Array(n);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    out[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
    b6 = w * 0.115926;
  }
  return out;
}

/** Integrated (leaky) white noise: deep and rumbly. */
function brown(n: number): Float32Array {
  const out = new Float32Array(n);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    out[i] = last;
  }
  return out;
}

const GENERATORS: Record<Exclude<NoiseKind, 'rain'>, Generator> = { white, pink, brown };

/**
 * Build a seamless looping buffer: generate a little extra, then crossfade that
 * tail over the start, so the last sample flows straight into the first.
 * Then normalize to the shared loudness target.
 */
function buildLoop(ctx: AudioContext, generate: Generator): AudioBuffer {
  const n = Math.floor(ctx.sampleRate * LOOP_SECONDS);
  const seam = Math.floor(ctx.sampleRate * SEAM_SECONDS);
  const raw = generate(n + seam);
  const data = raw.slice(0, n);
  for (let i = 0; i < seam; i++) {
    const t = i / seam; // 0 -> 1
    data[i] = raw[n + i] * (1 - t) + raw[i] * t;
  }

  // Remove DC offset (matters for brown noise), then scale to the target RMS.
  let mean = 0;
  for (let i = 0; i < n; i++) mean += data[i];
  mean /= n;
  let sumSq = 0;
  let peak = 0;
  for (let i = 0; i < n; i++) {
    data[i] -= mean;
    sumSq += data[i] * data[i];
    peak = Math.max(peak, Math.abs(data[i]));
  }
  const rms = Math.sqrt(sumSq / n) || 1;
  const scale = Math.min(TARGET_RMS / rms, 0.95 / (peak || 1));
  for (let i = 0; i < n; i++) data[i] *= scale;

  const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
  buffer.getChannelData(0).set(data);
  return buffer;
}

const cache = new WeakMap<AudioContext, Map<string, AudioBuffer>>();

function getBuffer(ctx: AudioContext, kind: Exclude<NoiseKind, 'rain'>): AudioBuffer {
  let perCtx = cache.get(ctx);
  if (!perCtx) cache.set(ctx, (perCtx = new Map()));
  let buffer = perCtx.get(kind);
  if (!buffer) perCtx.set(kind, (buffer = buildLoop(ctx, GENERATORS[kind])));
  return buffer;
}

/** One playing sound: a gain node to fade, and a way to stop its sources. */
export interface Voice {
  kind: NoiseKind;
  /** Per-sound gain, between the sound and the master gain. Starts at 0. */
  gain: GainNode;
  /** Stop all sources at `when` (AudioContext time) and disconnect afterwards. */
  stop(when: number): void;
}

/**
 * Create and start a sound, connected to `destination` through its own gain (at 0).
 * Chain: source -> (optional filter) -> sound gain -> destination.
 */
export function createVoice(ctx: AudioContext, kind: NoiseKind, destination: AudioNode): Voice {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(destination);

  const source = ctx.createBufferSource();
  source.buffer = getBuffer(ctx, kind === 'rain' ? 'pink' : kind);
  source.loop = true;
  // Start each voice at a random point so repeated starts don't sound identical.
  const offset = Math.random() * LOOP_SECONDS;
  const sources: AudioScheduledSourceNode[] = [source];

  if (kind === 'rain') {
    // Pink noise, band-passed to about 1–4 kHz, with a slow swell in level.
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 2000;
    band.Q.value = 0.5;

    const makeup = ctx.createGain(); // the band-pass removes a lot of energy
    makeup.gain.value = 2.2;

    const wobble = ctx.createGain();
    wobble.gain.value = 0.8;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.2;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.2; // gain swings 0.6 – 1.0
    lfo.connect(lfoDepth).connect(wobble.gain);

    source.connect(band).connect(makeup).connect(wobble).connect(gain);
    lfo.start();
    sources.push(lfo);
  } else {
    source.connect(gain);
  }
  source.start(0, offset);

  let stopped = false;
  return {
    kind,
    gain,
    stop(when) {
      if (stopped) return;
      stopped = true;
      for (const s of sources) s.stop(when);
      source.onended = () => gain.disconnect();
    },
  };
}
