<script lang="ts">
  import { timer } from './lib/timer.svelte';
  import TimerDisplay from './components/TimerDisplay.svelte';
  import Controls from './components/Controls.svelte';
  import PresetPicker from './components/PresetPicker.svelte';
</script>

<main class="app" data-phase={timer.phase}>
  <PresetPicker />
  <TimerDisplay />
  <Controls />
</main>

<style>
  .app {
    width: min(480px, 100%);
    margin: 0 auto;
    padding: var(--space-6) var(--space-4);
    display: grid;
    gap: var(--space-6);
  }
</style>
