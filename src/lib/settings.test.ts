import { describe, expect, it } from 'vitest';
import { defaultSettings, parseSettings } from './settings.svelte';

describe('parseSettings', () => {
  it('returns defaults for missing or corrupt data', () => {
    expect(parseSettings(null)).toEqual(defaultSettings());
    expect(parseSettings('not json')).toEqual(defaultSettings());
    expect(parseSettings('42')).toEqual(defaultSettings());
    expect(parseSettings('{"version":2,"preset":"deep"}')).toEqual(defaultSettings());
  });

  it('round-trips valid settings', () => {
    const s = { version: 1, preset: 'custom', custom: { focus: 40, shortBreak: 8, longBreak: 25 }, sound: 'rain', volume: 35 };
    expect(parseSettings(JSON.stringify(s))).toEqual(s);
  });

  it('falls back field by field', () => {
    const s = parseSettings(
      JSON.stringify({ version: 1, preset: 'bogus', custom: { focus: 999, shortBreak: 5, longBreak: 15 }, sound: 'jazz', volume: 140 }),
    );
    expect(s.preset).toBe('classic');
    expect(s.custom).toEqual({ focus: 180, shortBreak: 5, longBreak: 15 });
    expect(s.sound).toBe('off');
    expect(s.volume).toBe(100);
  });
});
