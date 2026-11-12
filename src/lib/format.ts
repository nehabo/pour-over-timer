/**
 * Milliseconds -> "mm:ss". Rounds up, so a fresh 25-minute timer shows 25:00
 * and 00:00 appears only when time is actually up. Minutes may exceed 59 (e.g. 90:00).
 */
export function formatMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
