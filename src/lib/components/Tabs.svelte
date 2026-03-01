<script lang="ts">
import { Tabs } from 'bits-ui';
import type { Snippet } from 'svelte';

interface Tab {
	value: string;
	label: string;
	content: Snippet;
}

interface TabsProps {
	tabs: Tab[];
	value?: string;
}

let { tabs, value = $bindable(tabs[0]?.value ?? '') }: TabsProps = $props();
</script>

<Tabs.Root bind:value class="tabs-root">
  <Tabs.List class="tabs-list">
    {#each tabs as tab (tab.value)}
      <Tabs.Trigger value={tab.value} class="tabs-trigger">{tab.label}</Tabs.Trigger>
    {/each}
  </Tabs.List>
  {#each tabs as tab (tab.value)}
    <Tabs.Content value={tab.value}>
      {@render tab.content()}
    </Tabs.Content>
  {/each}
</Tabs.Root>

<style>
  :global(.tabs-root) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5em;
    width: 100%;
  }

  :global(.tabs-list) {
    display: flex;
    gap: 0.5em;
    justify-content: center;
  }

  :global(.tabs-trigger) {
    background: none;
    box-shadow: none;
    opacity: 0.6;
    cursor: pointer;
    border: none;
    font-size: 1em;
    font-family: inherit;
    color: inherit;
    padding: 0;
  }

  :global(.tabs-trigger[data-state="active"]) {
    opacity: 1;
    text-decoration: underline;
  }
</style>
