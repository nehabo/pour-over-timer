<script lang="ts">
  import { timer } from './lib/timer.svelte';
  import { togglePip } from './lib/pip.svelte';
  import TimerDisplay from './components/TimerDisplay.svelte';
  import Controls from './components/Controls.svelte';
  import PresetPicker from './components/PresetPicker.svelte';
  import SoundPicker from './components/SoundPicker.svelte';
  import PipButton from './components/PipButton.svelte';

  /** Elements where a key press should keep its normal meaning. */
  function isTextEntry(el: EventTarget | null): boolean {
    if (!(el instanceof HTMLElement)) return false;
    if (el.isContentEditable || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
    return el instanceof HTMLInputElement && el.type !== 'range';
  }
  function isControl(el: EventTarget | null): boolean {
    return el instanceof HTMLButtonElement || el instanceof HTMLAnchorElement || el instanceof HTMLInputElement;
  }

  // Space: start/pause · R: reset · P: open/close PiP
  function onKeydown(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat || isTextEntry(e.target)) return;

    if (e.code === 'Space') {
      // On a focused button, Space already presses that button.
      if (isControl(e.target)) return;
      e.preventDefault(); // don't scroll the page
      timer.toggle();
    } else if (e.key === 'r' || e.key === 'R') {
      timer.reset();
    } else if (e.key === 'p' || e.key === 'P') {
      void togglePip();
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<main class="app" data-phase={timer.phase}>
  <PresetPicker />
  <TimerDisplay />
  <Controls />
  <SoundPicker />
  <PipButton />
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
