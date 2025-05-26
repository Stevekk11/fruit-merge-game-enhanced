<script lang="ts">
	import { onMount } from 'svelte';

	let screenshotDataUrl = $state<string | null>(null);
	let isLoading = $state(true); // Added state for loading indicator
	let errorMessage = $state<string | null>(null); // Optional: for error handling

	onMount(async () => {
		const gameplayArea = document.querySelector('.gameplay-area');

		if (!gameplayArea) {
			console.error('Gameplay area not found!');
			errorMessage = 'Could not find the gameplay area to screenshot.';
			isLoading = false;
			return;
		}

		try {
			const { toPng } = await import('html-to-image');
			screenshotDataUrl = await toPng(gameplayArea as HTMLElement, { fontEmbedCSS: '' });
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
		<img class="image" src={screenshotDataUrl} alt="Gameplay Screenshot" />
	{:else if errorMessage}
		<div class="error-message">
			<p>{errorMessage}</p>
		</div>
	{/if}
</div>

<style>
	.screenshot {
		width: 100%;
		aspect-ratio: 2 / 3;
		border-radius: 0.5em;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--color-background);
	}

	.image {
		display: block;
		width: 100%;
		height: 100%; /* Ensure image fills the container */
		object-fit: cover; /* To maintain aspect ratio and fill */
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
