<script lang="ts">
	import { GAME_WIDTH, GAME_WIDTH_PX } from '../constants';

	interface FruitProps {
		radius: number | string;
		name: string;
		display?: 'block' | 'inline';
		scale?: number;
	}

	let { radius, name, display = 'block', scale = 1 }: FruitProps = $props();

	const fruitImageUrl = $derived(`../svg/${name}.svg?component`);
	const FruitImage = $derived((await import(fruitImageUrl)).default);

	const width = $derived.by(() => {
		const scaledGameWidthPx = GAME_WIDTH_PX * scale;

		return Number.isFinite(radius)
			? `${(((radius as number) * 2) / GAME_WIDTH) * scaledGameWidthPx}px`
			: radius;
	});
</script>

<div
	data-name={name}
	class="fruit"
	style:width
	style:display={display === 'inline' ? 'inline-block' : display}>
	<FruitImage style="display: block;" />
</div>

<style>
	.fruit {
		aspect-ratio: 1 / 1;
		user-select: none;
	}
</style>
