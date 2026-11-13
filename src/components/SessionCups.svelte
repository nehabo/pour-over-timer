<script lang="ts">
  import { timer, LONG_BREAK_EVERY } from '../lib/timer.svelte';

  const cups = $derived(Array.from({ length: LONG_BREAK_EVERY }, (_, i) => i < timer.completedFocus));
</script>

<span
  class="cups"
  role="img"
  aria-label="{timer.completedFocus} of {LONG_BREAK_EVERY} sessions done"
>
  {#each cups as filled, i (i)}
    <svg class="cup" class:filled viewBox="0 0 24 24" aria-hidden="true">
      <!-- cup body -->
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z" />
      <!-- handle -->
      <path class="handle" d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16" />
      <!-- saucer -->
      <path class="handle" d="M3 21.5h14" />
    </svg>
  {/each}
</span>

<style>
  .cups {
    display: inline-flex;
    gap: 4px;
  }
  .cup {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: var(--text-muted);
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .cup.filled {
    stroke: var(--phase-accent);
    fill: var(--phase-accent);
  }
  .cup.filled .handle {
    fill: none;
  }
</style>
