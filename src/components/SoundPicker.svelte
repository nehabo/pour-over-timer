<script lang="ts">
  import { settings, SOUND_IDS, type SoundId } from '../lib/settings.svelte';

  const LABELS: Record<SoundId, string> = {
    off: 'Off',
    white: 'White',
    pink: 'Pink',
    brown: 'Brown',
    rain: 'Rain',
  };
</script>

<section class="sound" aria-labelledby="sound-heading">
  <h2 id="sound-heading" class="label">Ambient sound <span class="note">· plays during focus</span></h2>

  <div class="chips">
    {#each SOUND_IDS as id (id)}
      <button
        class="chip"
        aria-pressed={settings.sound === id}
        onclick={() => (settings.sound = id)}
      >
        {LABELS[id]}
      </button>
    {/each}
  </div>

  <label class="volume">
    <span class="label">Volume</span>
    <input
      type="range"
      min="0"
      max="100"
      step="1"
      bind:value={settings.volume}
      disabled={settings.sound === 'off'}
      aria-valuetext="{settings.volume}%"
    />
    <span class="value">{settings.volume}%</span>
  </label>
</section>

<style>
  .sound {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .label {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-muted);
    letter-spacing: 0.04em;
  }
  .note {
    font-weight: 400;
    opacity: 0.8;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-2);
  }
  .chip {
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    border-radius: var(--radius-pill);
    padding: 0.35rem 0.85rem;
    font-size: 0.85rem;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s,
      border-color 0.15s;
  }
  .chip:hover {
    color: var(--text);
    border-color: var(--text-muted);
  }
  .chip[aria-pressed='true'] {
    background: var(--surface-2);
    border-color: var(--accent);
    color: var(--text);
  }
  .volume {
    display: grid;
    grid-template-columns: auto 1fr 3ch;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
  }
  input[type='range'] {
    width: 100%;
    accent-color: var(--accent);
  }
  input:disabled {
    opacity: 0.4;
  }
  .value {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
</style>
