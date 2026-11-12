import { clampCustom, DEFAULT_DURATIONS, type Durations, type PresetId } from './presets';

export const STORAGE_KEY = 'focus-timer:settings';

export type SoundId = 'off' | 'white' | 'pink' | 'brown' | 'rain';
export const SOUND_IDS: readonly SoundId[] = ['off', 'white', 'pink', 'brown', 'rain'];
const PRESET_IDS: readonly PresetId[] = ['classic', 'deep', 'flow', 'custom'];

export interface Settings {
  version: 1;
  preset: PresetId;
  custom: Durations;
  sound: SoundId;
  /** 0–100 */
  volume: number;
}

export function defaultSettings(): Settings {
  return { version: 1, preset: 'classic', custom: { ...DEFAULT_DURATIONS }, sound: 'off', volume: 60 };
}

/**
 * Turn whatever was stored into valid Settings. Each field falls back to its
 * default on its own, so one bad value doesn't wipe the rest.
 */
export function parseSettings(raw: string | null): Settings {
  const s = defaultSettings();
  if (!raw) return s;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return s;
  }
  if (typeof data !== 'object' || data === null) return s;
  const d = data as Record<string, unknown>;
  // Only version 1 exists so far; future versions migrate here.
  if (d.version !== 1) return s;

  if (PRESET_IDS.includes(d.preset as PresetId)) s.preset = d.preset as PresetId;
  if (typeof d.custom === 'object' && d.custom !== null) {
    const c = clampCustom(d.custom as Record<keyof Durations, unknown>);
    if (c.ok) s.custom = c.durations;
  }
  if (SOUND_IDS.includes(d.sound as SoundId)) s.sound = d.sound as SoundId;
  if (typeof d.volume === 'number' && Number.isFinite(d.volume)) {
    s.volume = Math.min(100, Math.max(0, Math.round(d.volume)));
  }
  return s;
}

function readStored(): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage blocked (private mode, site data disabled)
  }
}

/** The app's settings. Mutate fields directly; initSettingsEffects saves changes. */
export const settings: Settings = $state(parseSettings(readStored()));

/** Save settings whenever they change. Called once from main.ts. */
export function initSettingsEffects(): () => void {
  return $effect.root(() => {
    $effect(() => {
      const json = JSON.stringify($state.snapshot(settings));
      try {
        localStorage.setItem(STORAGE_KEY, json);
      } catch {
        // storage full or blocked: settings just won't persist
      }
    });
  });
}
