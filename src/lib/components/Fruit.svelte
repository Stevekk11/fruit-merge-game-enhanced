<script lang="ts">
import { GAME_WIDTH, GAME_WIDTH_PX } from '../constants';

// Extract the SvgComponent type
import type BlueberrySvgComponent from '$lib/svg/blueberry.svg?component';
type SvgComponent = typeof BlueberrySvgComponent;

// Import all fruit manually
import Blueberry from '$lib/svg/blueberry.svg?component';
import Grape from '$lib/svg/grape.svg?component';
import Lemon from '$lib/svg/lemon.svg?component';
import Orange from '$lib/svg/orange.svg?component';
import Apple from '$lib/svg/apple.svg?component';
import Dragonfruit from '$lib/svg/dragonfruit.svg?component';
import Pear from '$lib/svg/pear.svg?component';
import Peach from '$lib/svg/peach.svg?component';
import Pineapple from '$lib/svg/pineapple.svg?component';
import Honeydew from '$lib/svg/honeydew.svg?component';
import Watermelon from '$lib/svg/watermelon.svg?component';

const fruitSvgs: Record<string, SvgComponent> = {
	Blueberry,
	Grape,
	Lemon,
	Orange,
	Apple,
	Dragonfruit,
	Pear,
	Peach,
	Pineapple,
	Honeydew,
	Watermelon
};

interface FruitProps {
	radius: number | string;
	name: string;
	display?: 'block' | 'inline';
	scale?: number;
	danger?: boolean;
}

let { radius, name, display = 'block', scale = 1, danger = false }: FruitProps = $props();

const width = $derived.by(() => {
	const scaledGameWidthPx = GAME_WIDTH_PX * scale;

	return Number.isFinite(radius)
		? `${(((radius as number) * 2) / GAME_WIDTH) * scaledGameWidthPx}px`
		: radius;
});
const FruitComponent = $derived.by(() => {
	const fruitKey = `${name.at(0).toUpperCase()}${name.slice(1)}`;
	// Handle the case where a fruit SVG might not be found to prevent runtime errors.
	if (!fruitKey) return null;
	return fruitSvgs[fruitKey];
});
</script>

<div
  data-name={name}
  class="fruit"
  class:danger
  style:width
  style:display={display === "inline" ? "inline-block" : display}
>
  {#if FruitComponent}<FruitComponent style="display: block" {name} />{/if}
</div>

<style>
  .fruit {
    aspect-ratio: 1 / 1;
    user-select: none;
    outline: 3px solid transparent;
    outline-offset: 10px;
    transition: outline-color 150ms ease-in;
  }

  .fruit.danger {
    border-radius: 50%;
    outline: 3px solid hotpink;
  }
</style>
