<script lang="ts">
import { onMount, getContext } from 'svelte';
import { fade } from 'svelte/transition';

let screenshotDataUrl = $state<string | null>(null);
let isLoading = $state(true); // Added state for loading indicator
let errorMessage = $state<string | null>(null); // Optional: for error handling

const generateScreenshot = getContext<() => Promise<string>>('generateScreenshot');

onMount(async () => {
	try {
		screenshotDataUrl = await generateScreenshot();
	} catch (error) {
		console.error('Failed to generate screenshot:', error);
		errorMessage = 'Failed to generate screenshot.';
	} finally {
		isLoading = false;
	}
});
</script>

<div class="screenshot">
	{#if isLoading}
		<div class="loading-indicator">Loading screenshot...</div>
	{:else if screenshotDataUrl}
		<img class="image" in:fade src={screenshotDataUrl} alt="Gameplay Screenshot" />
	{:else if errorMessage}
		<div class="error-message">
			<p>{errorMessage}</p>
		</div>
	{/if}
</div>

<style>
	.screenshot {
		position: relative;
		width: 100%;
		aspect-ratio: 2 / 3;
		border-radius: 0.5em;
		overflow: hidden;
		background-color: var(--color-background);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.loading-indicator,
	.error-message {
		text-align: center;
		padding: 1em;
	}

	.error-message p {
		color: red;
	}
</style>
