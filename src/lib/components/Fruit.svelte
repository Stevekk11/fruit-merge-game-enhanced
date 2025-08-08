<script lang="ts">
	import type { Component, SvelteComponent } from 'svelte';
	import { GAME_WIDTH, GAME_WIDTH_PX } from '../constants';
	const fruitSvgs: Record<string, { default: Component<SvelteComponent> }> = import.meta.glob(
		'$lib/svg/*.svg',
		{ eager: true, query: '?component' }
	);

	interface FruitProps {
		radius: number | string;
		name: string;
		display?: 'block' | 'inline';
		scale?: number;
	}

	let { radius, name, display = 'block', scale = 1 }: FruitProps = $props();

	const width = $derived.by(() => {
		const scaledGameWidthPx = GAME_WIDTH_PX * scale;

		return Number.isFinite(radius)
			? `${(((radius as number) * 2) / GAME_WIDTH) * scaledGameWidthPx}px`
			: radius;
	});
	const FruitComponent = $derived.by(() => {
		const fruitKey = Object.keys(fruitSvgs).find((key) => key.includes(name.toLowerCase()));
		// Handle the case where a fruit SVG might not be found to prevent runtime errors.
		if (!fruitKey) return null;
		return fruitSvgs[fruitKey]?.default;
	});
</script>

<div
	data-name={name}
	class="fruit"
	style:width
	style:display={display === 'inline' ? 'inline-block' : display}>
	{#if FruitComponent}<FruitComponent />{/if}
</div>

<style>
	.fruit {
		aspect-ratio: 1 / 1;
		user-select: none;
	}
</style>
