<script lang="ts">
	import { onMount } from 'svelte';
	import { getHighScores } from '../stores/db';

	// Define props using Svelte 5 $props rune
	interface Score {
		id: number;
		score: number;
		date: Date;
	}

	interface LeaderboardProps {
		localScores?: Score[];
		highlightScore?: number;
		activeTab?: 'local' | 'global';
	}
	let {
		localScores = [],
		highlightScore,
		activeTab = $bindable('local')
	}: LeaderboardProps = $props();

	let globalScores = $state<Score[]>([]);
	let internalLocalScores = $state<Score[]>(localScores);

	export const fetchLocalScores = async () => {
		try {
			internalLocalScores = (await getHighScores()) as Score[];
		} catch (err) {
			console.error('Failed to fetch local scores', err);
		}
	};

	export const fetchGlobalScores = async () => {
		try {
			const res = await fetch('http://localhost:4033/api/leaderboard');
			if (res.ok) {
				const data = await res.json();
				globalScores = data.scores.map((s: { id: number; score: number; created_at: string }) => ({
					id: s.id,
					score: s.score,
					date: new Date(s.created_at)
				}));
			}
		} catch (err) {
			console.error('Failed to fetch global scores', err);
		}
	};

	$effect(() => {
		if (activeTab === 'global' && globalScores.length === 0) {
			fetchGlobalScores();
		}
	});

	onMount(() => {
		if (internalLocalScores.length === 0) {
			fetchLocalScores();
		}
	});

	let currentScores = $derived(activeTab === 'local' ? internalLocalScores : globalScores);

	let tableContainer: HTMLDivElement | null = $state(null);

	$effect(() => {
		// By reading 'currentScores' here, we make it a reactive dependency of the effect.
		// This ensures the effect re-runs if the scores data itself changes,
		// which is important because the row we're looking for depends on this data.
		const scoresData = currentScores;

		if (
			highlightScore == null || // No score to highlight
			!tableContainer || // The scroll container isn't in the DOM yet
			!scoresData || // Scores data isn't available
			scoresData.length === 0 // Scores data is empty
		) {
			return;
		}

		// Using requestAnimationFrame to ensure DOM is updated after activeTab changes
		requestAnimationFrame(() => {
			if (!tableContainer) return;
			const row = tableContainer.querySelector(
				`tr[data-score="${highlightScore}"]`
			) as HTMLElement | null;
			row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		});
	});

	// Date formatter remains the same
	const formatter = new Intl.DateTimeFormat('en-US', {
		year: '2-digit',
		month: '2-digit',
		day: '2-digit'
	});
</script>

<div class="leaderboard">
	<div class="tabs">
		<button class:active={activeTab === 'local'} onclick={() => (activeTab = 'local')}
			>Local Data</button>
		<button class:active={activeTab === 'global'} onclick={() => (activeTab = 'global')}
			>Global</button>
	</div>
	<div class="scores" class:global={activeTab === 'global'}>
		<div class="scoresScroll" bind:this={tableContainer}>
			{#if currentScores && currentScores.length > 0}
				<table>
					<tbody>
						{#each currentScores as score, index (score.id)}
							{@const rank = index + 1}
							<tr data-score={score.score} class:highlight={score.score === highlightScore}>
								<td class="rank">{rank}</td>
								<td class="score">
									<strong>{Intl.NumberFormat().format(score.score)}</strong>
								</td>
								<td class="createdAt">{formatter.format(score.date)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<div class="empty">No scores yet.</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.leaderboard {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5em;
	}

	.tabs {
		display: flex;
		gap: 0.5em;
		justify-content: center;
	}

	.tabs button {
		background: none;
		box-shadow: none;
		opacity: 0.6;
		cursor: pointer;
		border: none;
		font-size: 1em;
	}

	.tabs button.active {
		opacity: 1;
		text-decoration: underline;
	}

	.empty {
		padding: 2em;
		text-align: center;
		color: #666;
	}

	.scores {
		border: var(--color-border-light) 1px solid;
		border-radius: 10px;
		width: 100%;
	}

	.scoresScroll {
		mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 1em);
		min-width: 10em;
		height: 7.5em;
		overflow-y: auto;
		overflow-x: hidden;
	}

	/* Combined selectors - using createdAt based on JSX */
	.rank,
	.score,
	.createdAt {
		font-style: normal;
		font-variant-numeric: tabular-nums;
		font-feature-settings: 'ss01';
	}

	.createdAt {
		text-align: right;
		font-size: 0.9em;
	}

	.score {
		text-align: right;
	}

	/* .name class was in original CSS but not used in JSX, omitted here */

	table {
		border-collapse: collapse;
		width: 100%;
	}

	td {
		border-bottom: var(--color_light-border) 1px dotted;
		padding: 0.4em 0.5em;
	}

	/* Flattened nested selectors */
	td:first-child {
		padding-left: 1em;
	}

	td:last-child {
		padding-right: 1em;
	}

	tr:last-child td {
		border-bottom: none;
	}

	tr:nth-child(even) {
		background: var(--color-background);
	}

	tr.highlight {
		background-color: rgba(68, 253, 115, 0.11);
	}
</style>
