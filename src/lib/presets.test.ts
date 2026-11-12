import { describe, expect, it } from 'vitest';
import { clampCustom, durationsFor } from './presets';

describe('clampCustom', () => {
  it('accepts in-range values unchanged', () => {
    expect(clampCustom({ focus: 30, shortBreak: 7, longBreak: 20 })).toEqual({
      ok: true,
      durations: { focus: 30, shortBreak: 7, longBreak: 20 },
      adjusted: [],
    });
  });

  it('clamps out-of-range values and reports which changed', () => {
    expect(clampCustom({ focus: 500, shortBreak: 0, longBreak: -3 })).toEqual({
      ok: true,
      durations: { focus: 180, shortBreak: 1, longBreak: 1 },
      adjusted: ['focus', 'shortBreak', 'longBreak'],
    });
  });

  it('rounds to whole minutes', () => {
    const r = clampCustom({ focus: 24.6, shortBreak: 5, longBreak: 15 });
    expect(r.ok && r.durations.focus).toBe(25);
    expect(r.ok && r.adjusted).toEqual(['focus']);
  });

  it('accepts numeric strings', () => {
    const r = clampCustom({ focus: '45', shortBreak: '10', longBreak: '61' });
    expect(r).toEqual({ ok: true, durations: { focus: 45, shortBreak: 10, longBreak: 60 }, adjusted: ['longBreak'] });
  });

  it('rejects blanks and non-numbers', () => {
    expect(clampCustom({ focus: null, shortBreak: '', longBreak: 'abc' })).toEqual({
      ok: false,
      blank: ['focus', 'shortBreak', 'longBreak'],
    });
    expect(clampCustom({ focus: 25, shortBreak: undefined, longBreak: 15 })).toEqual({
      ok: false,
      blank: ['shortBreak'],
    });
  });
});

describe('durationsFor', () => {
  const custom = { focus: 40, shortBreak: 8, longBreak: 25 };
  it('returns preset durations', () => {
    expect(durationsFor('deep', custom)).toEqual({ focus: 50, shortBreak: 10, longBreak: 20 });
  });
  it('returns custom durations for custom', () => {
    expect(durationsFor('custom', custom)).toEqual(custom);
  });
});
