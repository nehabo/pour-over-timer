import { describe, expect, it } from 'vitest';
import { formatMs } from './format';

describe('formatMs', () => {
  it('formats whole minutes', () => {
    expect(formatMs(25 * 60_000)).toBe('25:00');
    expect(formatMs(90 * 60_000)).toBe('90:00');
  });
  it('rounds partial seconds up', () => {
    expect(formatMs(59_001)).toBe('01:00');
    expect(formatMs(1)).toBe('00:01');
    expect(formatMs(61_500)).toBe('01:02');
  });
  it('clamps at zero', () => {
    expect(formatMs(0)).toBe('00:00');
    expect(formatMs(-5000)).toBe('00:00');
  });
});
