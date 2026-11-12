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
