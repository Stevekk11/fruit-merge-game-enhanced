<script lang="ts">
import { Progress } from 'bits-ui';

interface ProgressProps {
	value: number;
	max?: number;
	label?: string;
	labelRight?: string;
	class?: string;
}

let { value, max = 100, label, labelRight, class: className = '' }: ProgressProps = $props();
</script>

<div class="progress-wrapper {className}">
  {#if label || labelRight}
    <div class="progress-labels">
      {#if label}<span class="progress-label-left">{label}</span>{/if}
      {#if labelRight}<span class="progress-label-right">{labelRight}</span>{/if}
    </div>
  {/if}
  <Progress.Root {value} {max} aria-label={label ?? 'Progress'}>
    <div class="progress-track">
      <div class="progress-indicator" style="width: {Math.round((value / max) * 100)}%"></div>
    </div>
  </Progress.Root>
</div>

<style>
  .progress-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    width: 100%;
  }

  .progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75em;
    color: #888;
  }

  .progress-track {
    height: 6px;
    border-radius: 9999px;
    background: var(--color-border-light, rgba(255, 255, 255, 0.15));
    overflow: hidden;
    width: 100%;
  }

  .progress-indicator {
    height: 100%;
    border-radius: 9999px;
    background: var(--color-text, #fff);
    opacity: 0.5;
    transition: width 0.5s ease;
  }
</style>
