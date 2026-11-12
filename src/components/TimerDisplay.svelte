<script lang="ts">
  import { timer, LONG_BREAK_EVERY } from '../lib/timer.svelte';
  import { formatMs } from '../lib/format';
  import { PHASE_LABEL } from '../lib/presets';

  const dots = $derived(
    Array.from({ length: LONG_BREAK_EVERY }, (_, i) => i < timer.completedFocus),
  );
  // Announced politely, and it changes only once a minute, not every second.
  const announcement = $derived(
    `${PHASE_LABEL[timer.phase]}: ${timer.minutesLeft} ${timer.minutesLeft === 1 ? 'minute' : 'minutes'} left`,
  );
</script>

<section class="display">
  <div class="phase-row">
    <span class="phase">{PHASE_LABEL[timer.phase]}</span>
    <span class="dots" aria-label="{timer.completedFocus} of {LONG_BREAK_EVERY} focus sessions done">
      {#each dots as filled, i (i)}
        <span class="dot" class:filled aria-hidden="true"></span>
      {/each}
    </span>
  </div>

  <div class="time" aria-hidden="true">{formatMs(timer.remaining)}</div>
  <div class="sr-only" aria-live="polite">{announcement}</div>

  <div class="bar" aria-hidden="true">
    <div class="fill" style:transform="scaleX({timer.progress})"></div>
  </div>
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
    color: var(--text-muted);
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .phase {
    color: var(--accent);
    font-weight: 600;
  }
  .dots {
    display: inline-flex;
    gap: 6px;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1.5px solid var(--text-muted);
  }
  .dot.filled {
    background: var(--accent);
    border-color: var(--accent);
  }
  .time {
    font-size: clamp(4.5rem, 20vw, 8rem);
    font-weight: 300;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .bar {
    width: min(320px, 100%);
    height: 4px;
    border-radius: 2px;
    background: var(--surface-2);
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: var(--accent);
    transform-origin: left;
    transition: transform 0.25s linear;
  }
</style>
