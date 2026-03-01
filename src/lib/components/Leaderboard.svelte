<script lang="ts">
import { onMount } from 'svelte';
import { getHighScores } from '../stores/db';
import type { LeaderboardClient, LeaderboardScore } from '../api/leaderboard-client.svelte';
import Tabs from './Tabs.svelte';

interface LeaderboardProps {
	leaderboardClient?: LeaderboardClient;
	localScores?: LeaderboardScore[];
	activeTab?: 'daily' | 'overall' | 'local';
}
let {
	leaderboardClient,
	localScores = [],
	activeTab = $bindable('daily')
}: LeaderboardProps = $props();

let internalLocalScores = $state<LeaderboardScore[]>(localScores);
let usernameInput = $state(
	typeof window !== 'undefined' ? window.localStorage.getItem('subak_initials') || '' : ''
);

export const fetchLocalScores = async () => {
	try {
		internalLocalScores = (await getHighScores()) as LeaderboardScore[];
	} catch (err) {
		console.error('Failed to fetch local scores', err);
	}
};

$effect(() => {
	if (activeTab === 'daily' && leaderboardClient?.dailyScoresStatus === 'idle') {
		leaderboardClient.fetchDailyScores();
	}
	if (activeTab === 'overall' && leaderboardClient?.overallScoresStatus === 'idle') {
		leaderboardClient.fetchOverallScores();
	}
	if (activeTab === 'local') {
		fetchLocalScores();
	}
});

onMount(() => {
	if (internalLocalScores.length === 0 && activeTab === 'local') {
		fetchLocalScores();
	}
});

let leaderboardEl: HTMLDivElement | null = $state(null);

$effect(() => {
	const submittedId = leaderboardClient?.submittedId;
	const scores = leaderboardClient?.dailyScores;

	if (submittedId == null || !leaderboardEl || !scores || scores.length === 0) return;

	requestAnimationFrame(() => {
		if (!leaderboardEl) return;
		const row = leaderboardEl.querySelector(
			`[data-tabs-content][data-state="active"] tr[data-id="${submittedId}"]`
		) as HTMLElement | null;
		row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		(row?.querySelector('input') as HTMLInputElement | null)?.focus();
	});
});

async function handleUsernameSubmit() {
	const trimmed = usernameInput.trim().toUpperCase();
	if (trimmed.length !== 3 && trimmed.length !== 0) return;
	if (!leaderboardClient) return;

	await leaderboardClient.updateUsername(trimmed);
	if (typeof window !== 'undefined') {
		window.localStorage.setItem('subak_initials', trimmed);
	}
}

const formatter = new Intl.DateTimeFormat('en-US', {
	year: '2-digit',
	month: '2-digit',
	day: '2-digit'
});
</script>

{#snippet scoreTable(scores: LeaderboardScore[], showInput: boolean)}
  <div class="scoresScroll">
    {#if scores && scores.length > 0}
      <table>
        <tbody>
          {#each scores as score, index (score.id)}
            {@const rank = index + 1}
            {@const isSubmitted = leaderboardClient?.submittedId === score.id}
            <tr
              data-id={score.id}
              class:highlight={isSubmitted}
            >
              <td class="rank">{rank}</td>
              <td class="username">
                {#if isSubmitted && showInput}
                  <input
                    class="initials-input"
                    type="text"
                    bind:value={usernameInput}
                    maxlength="3"
                    autocomplete="off"
                    data-1p-ignore
                    onkeydown={(e) => {
                      usernameInput = usernameInput.toUpperCase();
                      if (e.key === 'Enter') handleUsernameSubmit();
                    }}
                    oninput={() => { usernameInput = usernameInput.toUpperCase(); }}
                    placeholder="???"
                  />
                {:else}
                  {score.username || '???'}
                {/if}
              </td>
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
{/snippet}

{#snippet localScoresPanel()}
  <div class="scores">
    <div class="scoresScroll">
      {#if internalLocalScores && internalLocalScores.length > 0}
        <table>
          <tbody>
            {#each internalLocalScores as score, index (score.id)}
              {@const rank = index + 1}
              <tr data-id={score.id}>
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
{/snippet}

{#snippet dailyPanel()}
  <div class="scores">
    {#if leaderboardClient?.dailyScoresStatus === 'loading'}
      <div class="empty">Loading...</div>
    {:else if leaderboardClient?.dailyScoresStatus === 'error'}
      <div class="empty">Failed to load scores.</div>
    {:else}
      {@render scoreTable(leaderboardClient?.dailyScores ?? [], true)}
    {/if}
  </div>
{/snippet}

{#snippet overallPanel()}
  <div class="scores">
    {#if leaderboardClient?.overallScoresStatus === 'loading'}
      <div class="empty">Loading...</div>
    {:else if leaderboardClient?.overallScoresStatus === 'error'}
      <div class="empty">Failed to load scores.</div>
    {:else}
      {@render scoreTable(leaderboardClient?.overallScores ?? [], false)}
    {/if}
  </div>
{/snippet}

<div class="leaderboard" bind:this={leaderboardEl}>
  <Tabs
    bind:value={activeTab}
    tabs={[
      { value: 'daily', label: 'Daily', content: dailyPanel },
      { value: 'overall', label: 'Overall', content: overallPanel },
      { value: 'local', label: 'Local', content: localScoresPanel }
    ]}
  />
</div>

<style>
  .leaderboard {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5em;
    width: 100%;
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

  .rank,
  .score,
  .createdAt {
    font-style: normal;
    font-variant-numeric: tabular-nums;
    font-feature-settings: "ss01";
  }

  .createdAt {
    text-align: right;
    font-size: 0.9em;
  }

  .score {
    text-align: right;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  td {
    border-bottom: var(--color_light-border) 1px dotted;
    padding: 0.4em 0.5em;
  }

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

  .initials-input {
    width: 4em;
    padding: 0.1em 0.2em;
    font-size: 0.9em;
    font-family: monospace;
    font-variant-numeric: tabular-nums;
    text-align: center;
    letter-spacing: 0.15em;
    border-radius: 4px;
    border: 1px solid var(--color-border);
    background: var(--color-background-light);
    color: var(--color-text);
    text-transform: uppercase;
  }

  .initials-input:focus {
    outline: var(--color-focus-outline) 2px solid;
    border-color: transparent;
  }
</style>
