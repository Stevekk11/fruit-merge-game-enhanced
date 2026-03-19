<script lang="ts">
	import {GAME_WIDTH, GAME_WIDTH_PX} from '../constants';

	interface BombProps {
        radius: number;
        scale?: number;
    }

    let {radius, scale = 1}: BombProps = $props();

    const scaledGameWidthPx = GAME_WIDTH_PX * scale;
    const width = `${((radius * 2) / GAME_WIDTH) * scaledGameWidthPx}px`;
</script>

<div class="bomb" style:width>
    <div class="bomb-inner"/>
</div>

<style>
    .bomb {
        aspect-ratio: 1 / 1;
        user-select: none;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .bomb-inner {
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at 35% 35%, #333, #000);
        border-radius: 50%;
        position: relative;
        box-shadow: inset -1px -1px 3px rgba(0, 0, 0, 0.8),
        inset 1px 1px 3px rgba(255, 255, 255, 0.1);
    }

    .bomb-inner::before {
        content: '';
        position: absolute;
        top: 5%;
        left: 50%;
        transform: translateX(-50%);
        width: 20%;
        height: 20%;
        background: #222;
        border-radius: 50%;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
    }
</style>

