<script lang="ts">
  import { timer } from '../lib/timer.svelte';
  import { formatMs } from '../lib/format';
  import { PHASE_LABEL } from '../lib/presets';

  const running = $derived(timer.status === 'running');
</script>

<!-- Rendered inside the PiP window. Reads the same store as the main page. -->
<div class="mini" data-phase={timer.phase}>
  <div class="phase">{PHASE_LABEL[timer.phase]}</div>
  <div class="time">{formatMs(timer.remaining)}</div>
  <div class="buttons">
    <button
      class="btn primary"
      onclick={timer.toggle}
      aria-label={running ? 'Pause timer' : 'Start timer'}
    >
      {running ? 'Pause' : timer.status === 'paused' ? 'Resume' : 'Start'}
    </button>
    <button class="btn ghost" onclick={timer.skip} aria-label="Skip to next phase">Skip</button>
  </div>
</div>

<style>
  /* Background tinted by phase so the state reads at a glance. */
  .mini {
    position: fixed;
    inset: 0;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 0.35rem;
    padding: 0.5rem;
    background: color-mix(in srgb, var(--accent) 22%, var(--bg));
    color: var(--text);
    transition: background 0.4s;
  }
  .phase {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .time {
    font-size: 3rem;
    font-weight: 300;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .buttons {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }
  .btn {
    padding: 0.35rem 0.9rem;
    font-size: 0.85rem;
  }
  .btn.ghost {
    color: var(--text);
    border-color: color-mix(in srgb, var(--text) 30%, transparent);
  }
</style>
