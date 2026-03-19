<script lang="ts">
    import {onMount} from 'svelte';

    interface ScoreTextProps {
        score: number;
        comboCount: number;
        startTime: number;
        duration: number;
        scale?: number;
    }

    let {score, comboCount, startTime, duration, scale = 1}: ScoreTextProps = $props();

    let currentTime = $state(performance.now());
    let animationFrameId: number | null = null;

    onMount(() => {
        const updateTime = () => {
            currentTime = performance.now();
            animationFrameId = requestAnimationFrame(updateTime);
        };
        animationFrameId = requestAnimationFrame(updateTime);

        return () => {
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    });

    const progress = $derived((currentTime - startTime) / duration);
    const opacityProgress = $derived(Math.max(0, 1 - progress));

    // Combo color progression: white → yellow → orange → red → pink
    const comboColor = $derived.by(() => {
        if (comboCount <= 1) return 'hsl(0,0%,50%)'; // White
        if (comboCount <= 2) return 'hsl(48, 100%, 60%)'; // Yellow
        if (comboCount <= 3) return 'hsl(35, 100%, 55%)'; // Orange
        if (comboCount <= 5) return 'hsl(0, 100%, 50%)'; // Red
        return 'hsl(330, 100%, 60%)'; // Pink
    });

    // Scale animation: start at 1, grow slightly
    const animationScale = $derived(1 + progress * 0.3);
    // Vertical movement: start higher, then hover up even more
    const yOffset = $derived(100 + progress * 60);
</script>

<div class="score-text-container" style:--opacity={opacityProgress} style:--scale={animationScale}
     style:--y-offset={yOffset}>
    <div class="score-value" style:color={comboColor}>
        {score}
    </div>
    {#if comboCount > 1}
        <div class="combo-label" style:color={comboColor}>
            COMBO ×{comboCount}
        </div>
    {/if}
</div>

<style>
    .score-text-container {
        --opacity: 1;
        --scale: 1;
        --y-offset: 0;

        pointer-events: none;
        opacity: var(--opacity);
        transform: scale(var(--scale)) translateY(calc(var(--y-offset) * -1px));
        transition: none;
    }

    .score-value {
        font-size: 3rem;
        font-weight: 900;
        line-height: 1;
        text-align: center;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        font-family: system-ui, -apple-system, sans-serif;
        letter-spacing: -0.02em;
    }

    .combo-label {
        font-size: 0.9rem;
        font-weight: 700;
        line-height: 1;
        text-align: center;
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        font-family: system-ui, -apple-system, sans-serif;
        margin-top: 0.3rem;
        letter-spacing: 0.05em;
    }
</style>


