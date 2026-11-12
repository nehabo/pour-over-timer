export type Phase = 'focus' | 'shortBreak' | 'longBreak';

/** Phase lengths in minutes. */
export type Durations = Record<Phase, number>;

export type PresetId = 'classic' | 'deep' | 'flow' | 'custom';

export interface Preset {
  id: Exclude<PresetId, 'custom'>;
  label: string;
  durations: Durations;
}

export const PRESETS: readonly Preset[] = [
  { id: 'classic', label: 'Classic', durations: { focus: 25, shortBreak: 5, longBreak: 15 } },
  { id: 'deep', label: 'Deep', durations: { focus: 50, shortBreak: 10, longBreak: 20 } },
  { id: 'flow', label: 'Flow', durations: { focus: 90, shortBreak: 20, longBreak: 30 } },
];

export const DEFAULT_DURATIONS: Durations = PRESETS[0].durations;

export const PHASES: readonly Phase[] = ['focus', 'shortBreak', 'longBreak'];

/** Allowed custom ranges, in minutes. */
export const CUSTOM_RANGES: Record<Phase, { min: number; max: number }> = {
  focus: { min: 1, max: 180 },
  shortBreak: { min: 1, max: 60 },
  longBreak: { min: 1, max: 60 },
};

export const PHASE_LABEL: Record<Phase, string> = {
  focus: 'Focus',
  shortBreak: 'Short break',
  longBreak: 'Long break',
};

/** Durations for a preset id; 'custom' uses the given custom values. */
export function durationsFor(preset: PresetId, custom: Durations): Durations {
  if (preset === 'custom') return { ...custom };
  const found = PRESETS.find((p) => p.id === preset) ?? PRESETS[0];
  return { ...found.durations };
}

export type ClampResult =
  | { ok: true; durations: Durations; adjusted: Phase[] }
  | { ok: false; blank: Phase[] };

/**
 * Validate raw custom inputs. Blank or non-numeric values are rejected; numbers
 * are rounded to whole minutes and clamped to CUSTOM_RANGES. `adjusted` lists
 * the fields that had to change, so the UI can say so.
 */
export function clampCustom(raw: Record<Phase, unknown>): ClampResult {
  const blank: Phase[] = [];
  const adjusted: Phase[] = [];
  const durations = {} as Durations;

  for (const phase of PHASES) {
    const value = raw[phase];
    const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
    if (!Number.isFinite(n)) {
      blank.push(phase);
      continue;
    }
    const { min, max } = CUSTOM_RANGES[phase];
    const clamped = Math.min(max, Math.max(min, Math.round(n)));
    if (clamped !== n) adjusted.push(phase);
    durations[phase] = clamped;
  }

  return blank.length > 0 ? { ok: false, blank } : { ok: true, durations, adjusted };
}
