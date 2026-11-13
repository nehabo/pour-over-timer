<script lang="ts">
  import { timer } from '../lib/timer.svelte';
  import { formatMs } from '../lib/format';
  import { IDLE_HINT, PHASE_LABEL } from '../lib/presets';
  import SessionCups from './SessionCups.svelte';

  // Announced politely, and it changes only once a minute, not every second.
  const announcement = $derived(
    `${PHASE_LABEL[timer.phase]}: ${timer.minutesLeft} ${timer.minutesLeft === 1 ? 'minute' : 'minutes'} left`,
  );
</script>

<section class="display">
  <div class="phase-row">
    <span class="phase">{PHASE_LABEL[timer.phase]}</span>
    <SessionCups />
  </div>

  <div class="time" aria-hidden="true">{formatMs(timer.remaining)}</div>
  <div class="sr-only" aria-live="polite">{announcement}</div>

  <div class="bar" aria-hidden="true">
    <div class="fill" style:transform="scaleX({timer.progress})"></div>
  </div>

  <p class="hint" class:hidden={timer.status !== 'idle'}>{IDLE_HINT}</p>
</section>

<style>
  .display {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
  }
  .phase-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  .phase {
    color: var(--phase-accent);
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .time {
    font-family: var(--font-display);
    font-size: clamp(4.5rem, 20vw, 8rem);
    font-weight: 400;
    font-variant-numeric: tabular-nums lining-nums;
    line-height: 1;
    letter-spacing: -0.01em;
  }
  .bar {
    width: min(320px, 100%);
    height: 4px;
    border-radius: 2px;
    background: var(--surface);
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: var(--phase-accent);
    transform-origin: left;
    transition: transform 0.25s linear;
  }
  .hint {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-muted);
    font-style: italic;
  }
  /* Keep the line's space so the layout doesn't jump when the timer starts. */
  .hint.hidden {
    visibility: hidden;
  }
</style>
