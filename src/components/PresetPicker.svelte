<script lang="ts">
  import { timer } from '../lib/timer.svelte';
  import { settings } from '../lib/settings.svelte';
  import { clampCustom, CUSTOM_RANGES, PHASES, PHASE_LABEL, PRESETS, type Phase } from '../lib/presets';

  const locked = $derived(timer.status === 'running');

  // Draft values for the custom form; number inputs give a number, or null when blank.
  let draft = $state<Record<Phase, number | null>>({ ...settings.custom });
  let message = $state('');

  function chooseCustom() {
    draft = { ...settings.custom };
    message = '';
    timer.setPreset('custom');
  }

  function applyCustom(event: SubmitEvent) {
    event.preventDefault();
    const result = clampCustom(draft);
    if (!result.ok) {
      message = `Enter a value for ${result.blank.map((p) => PHASE_LABEL[p].toLowerCase()).join(', ')}.`;
      return;
    }
    draft = { ...result.durations };
    if (!timer.setCustom(result.durations)) return;
    message =
      result.adjusted.length > 0
        ? 'Some values were adjusted to the allowed range.'
        : 'Custom durations applied.';
  }
</script>

<section class="presets" aria-label="Session length">
  <div class="chips">
    {#each PRESETS as preset (preset.id)}
      <button
        class="chip"
        aria-pressed={settings.preset === preset.id}
        disabled={locked}
        onclick={() => timer.setPreset(preset.id)}
        title="{preset.durations.focus} / {preset.durations.shortBreak} / {preset.durations.longBreak} min"
      >
        {preset.label}
      </button>
    {/each}
    <button class="chip" aria-pressed={settings.preset === 'custom'} disabled={locked} onclick={chooseCustom}>
      Custom
    </button>
  </div>

  {#if locked}
    <p class="hint">Pause to change duration.</p>
  {/if}

  {#if settings.preset === 'custom'}
    <form class="custom" onsubmit={applyCustom} novalidate>
      {#each PHASES as phase (phase)}
        <label>
          <span>{PHASE_LABEL[phase]}</span>
          <input
            type="number"
            inputmode="numeric"
            min={CUSTOM_RANGES[phase].min}
            max={CUSTOM_RANGES[phase].max}
            step="1"
            bind:value={draft[phase]}
            disabled={locked}
          />
          <small>{CUSTOM_RANGES[phase].min}–{CUSTOM_RANGES[phase].max} min</small>
        </label>
      {/each}
      <button class="btn apply" type="submit" disabled={locked}>Apply</button>
      {#if message}
        <p class="message" role="status">{message}</p>
      {/if}
    </form>
  {/if}
</section>

<style>
  .presets {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
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
    padding: 0.4rem 0.95rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s,
      border-color 0.15s;
  }
  .chip:hover:not(:disabled) {
    color: var(--text);
    border-color: var(--text-muted);
  }
  .chip[aria-pressed='true'] {
    background: var(--surface-2);
    border-color: var(--accent);
    color: var(--text);
  }
  .chip:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .hint {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  .custom {
    display: grid;
    grid-template-columns: repeat(3, 1fr) auto;
    align-items: end;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-4);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  label {
    display: grid;
    gap: var(--space-1);
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  input {
    width: 100%;
    padding: 0.45rem 0.6rem;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-variant-numeric: tabular-nums;
  }
  input:disabled {
    opacity: 0.5;
  }
  small {
    font-size: 0.7rem;
  }
  .apply {
    margin-bottom: 1.35rem; /* line up with the inputs, above the range hints */
  }
  .message {
    grid-column: 1 / -1;
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  @media (max-width: 420px) {
    .custom {
      grid-template-columns: repeat(3, 1fr);
    }
    .apply {
      grid-column: 1 / -1;
      margin-bottom: 0;
    }
  }
</style>
