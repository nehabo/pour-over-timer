<script lang="ts">
  import { pip, pipSupported, togglePip } from '../lib/pip.svelte';
</script>

{#if pipSupported}
  <div class="pip">
    <button
      class="btn ghost"
      aria-pressed={pip.open}
      onclick={togglePip}
      title="Picture-in-Picture (P)"
    >
      {pip.open ? 'Close mini window' : 'Open mini window'}
    </button>
  </div>
{/if}

<style>
  .pip {
    display: flex;
    justify-content: center;
  }
</style>
