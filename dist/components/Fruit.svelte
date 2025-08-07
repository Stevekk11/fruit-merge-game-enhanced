<script lang="ts">
	import { GAME_WIDTH, GAME_WIDTH_PX } from '../constants';

	import FruitImage from './FruitImage.svelte';

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
	const colorVar = $derived(`--color-${name.toLowerCase()}`);
</script>

<div
	data-name={name}
	class="fruit"
	style:width
	style:display={display === 'inline' ? 'inline-block' : display}>
	<svelte:boundary>
		{#snippet pending()}
			<div class="loading-fruit" style:color={`var(${colorVar})`}>
				{name}
			</div>
		{/snippet}
		<FruitImage {name} />
	</svelte:boundary>
</div>

<style>
	.fruit {
		aspect-ratio: 1 / 1;
		user-select: none;
	}

	.loading-fruit {
		aspect-ratio: 1 / 1;
		border: currentColor 2px solid;
		border-radius: 50%;
		font-size: 12px;
		font-weight: bold;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
