import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Timer } from './timer.svelte';
import { settings } from './settings.svelte';

const MIN = 60_000;

describe('Timer', () => {
  let t: Timer;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-12T10:00:00Z'));
    t = new Timer();
  });
  afterEach(() => {
    t.reset();
    vi.useRealTimers();
  });

  it('starts idle at the full focus length', () => {
    expect(t.phase).toBe('focus');
    expect(t.status).toBe('idle');
    expect(t.remaining).toBe(25 * MIN);
  });

  it('counts down from endTime and pauses/resumes exactly', () => {
    t.start();
    vi.advanceTimersByTime(10 * MIN);
    expect(t.remaining).toBe(15 * MIN);

    t.pause();
    vi.advanceTimersByTime(5 * MIN); // time while paused doesn't count
    expect(t.remaining).toBe(15 * MIN);

    t.start();
    vi.advanceTimersByTime(MIN);
    expect(t.remaining).toBe(14 * MIN);
  });

  it('stays correct when ticks are throttled (background tab)', () => {
    t.start();
    // Simulate a throttled tab: the clock moves 5 minutes but no interval fires.
    vi.setSystemTime(Date.now() + 5 * MIN);
    t.tick(); // e.g. from visibilitychange
    expect(t.remaining).toBe(20 * MIN);
  });

  it('reset returns to the full length of the current phase', () => {
    t.start();
    vi.advanceTimersByTime(3 * MIN);
    t.reset();
    expect(t.status).toBe('idle');
    expect(t.remaining).toBe(25 * MIN);
  });

  it('advances to a short break when focus time runs out, and does not auto-start', () => {
    t.start();
    vi.advanceTimersByTime(25 * MIN + 250);
    expect(t.phase).toBe('shortBreak');
    expect(t.status).toBe('idle');
    expect(t.completedFocus).toBe(1);
    expect(t.remaining).toBe(5 * MIN);
  });

  it('follows focus → short break ×3, then a long break after the 4th focus', () => {
    const phases: string[] = [t.phase];
    for (let i = 0; i < 8; i++) {
      t.skip();
      phases.push(t.phase);
    }
    expect(phases).toEqual([
      'focus', 'shortBreak',
      'focus', 'shortBreak',
      'focus', 'shortBreak',
      'focus', 'longBreak',
      'focus',
    ]);
    // Count resets after the long break.
    expect(t.completedFocus).toBe(0);
  });

  it('shows 4 completed sessions during the long break', () => {
    for (let i = 0; i < 7; i++) t.skip();
    expect(t.phase).toBe('longBreak');
    expect(t.completedFocus).toBe(4);
    expect(t.remaining).toBe(15 * MIN);
  });

  it('refuses duration changes while running', () => {
    t.start();
    expect(t.setDurations({ focus: 50, shortBreak: 10, longBreak: 20 })).toBe(false);
    expect(t.durations.focus).toBe(25);
  });

  it('setPreset changes durations and records the choice', () => {
    expect(t.setPreset('flow')).toBe(true);
    expect(t.remaining).toBe(90 * MIN);
    expect(settings.preset).toBe('flow');
    t.setPreset('classic');
  });

  it('setPreset is ignored while running', () => {
    t.start();
    expect(t.setPreset('deep')).toBe(false);
    expect(settings.preset).toBe('classic');
  });

  it('setCustom saves and selects custom durations', () => {
    t.setCustom({ focus: 1, shortBreak: 2, longBreak: 3 });
    expect(settings.preset).toBe('custom');
    expect(settings.custom).toEqual({ focus: 1, shortBreak: 2, longBreak: 3 });
    expect(t.remaining).toBe(MIN);
    t.setPreset('classic');
  });

  it('applies duration changes while paused and resets the phase', () => {
    t.start();
    vi.advanceTimersByTime(MIN);
    t.pause();
    expect(t.setDurations({ focus: 50, shortBreak: 10, longBreak: 20 })).toBe(true);
    expect(t.status).toBe('idle');
    expect(t.remaining).toBe(50 * MIN);
  });
});
