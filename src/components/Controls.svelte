<script lang="ts">
  import { timer } from '../lib/timer.svelte';

  const running = $derived(timer.status === 'running');
</script>

<div class="controls">
  <button class="btn ghost" onclick={timer.reset} aria-label="Reset timer" title="Reset (R)">
    Reset
  </button>
  <button
    class="btn primary"
    onclick={timer.toggle}
    aria-label={running ? 'Pause timer' : 'Start timer'}
    title="Start / pause (Space)"
  >
    {running ? 'Pause' : timer.status === 'paused' ? 'Resume' : 'Start'}
  </button>
  <button class="btn ghost" onclick={timer.skip} aria-label="Skip to next phase" title="Skip">
    Skip
  </button>
</div>

<style>
  .controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-3);
  }
  .primary {
    min-width: 8.5rem;
    font-size: 1.1rem;
    padding: 0.85rem 1.5rem;
  }
</style>
