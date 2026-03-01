<script lang="ts">
import Modal from './Modal.svelte';
import Leaderboard from './Leaderboard.svelte';
import ModalCreditsFooter from './ModalCreditsFooter.svelte';
import GameScreenshot from './GameScreenshot.svelte';
import type { GameState } from '../stores/game.svelte';

interface GameOverModalProps {
	open: boolean;
	score: number;
	onClose: () => void;
	gameState: GameState;
}
const { open, score, onClose, gameState }: GameOverModalProps = $props();

let tab = $state<'local' | 'global'>('local');
let username = $state(
	typeof window !== 'undefined' ? window.localStorage.getItem('subak_initials') || '' : ''
);

$effect(() => {
	if (username) {
		username = username.toUpperCase();
	}
});

let leaderboardRef: ReturnType<typeof Leaderboard> | null = $state(null);

const isSubmitting = $derived(gameState.leaderboard.submissionStatus === 'submitting');
const submissionStatus = $derived(gameState.leaderboard.submissionStatus);

$effect(() => {
	if (open && tab === 'local' && leaderboardRef) {
		leaderboardRef.fetchLocalScores();
	}
});

async function handleGlobalSubmit(e: Event) {
	e.preventDefault();
	const trimmedUsername = username.trim();
	if ((trimmedUsername.length > 0 && trimmedUsername.length !== 3) || isSubmitting) return;

	const token = gameState.leaderboard.sessionToken;
	if (!token) {
		console.error('Cannot submit: no session token');
		return;
	}

	const payload = await gameState.telemetry.buildSubmissionPayload(
		trimmedUsername || null,
		score,
		token
	);
	if (!payload) return;

	const result = await gameState.leaderboard.submitScore(payload);

	if (result.success) {
		if (typeof window !== 'undefined') {
			window.localStorage.setItem('subak_initials', username);
		}
		tab = 'global';
	}
}

function handleStartClick() {
	onClose();
}
</script>

{#snippet append()}
  <ModalCreditsFooter />
{/snippet}

<Modal {open} {onClose} {append} title="Game Over">
  <div class="content">
    <h2 class="heading">Thanks for playing!</h2>

    <div class="score-and-screen">
      <div class="scores">
        <div class="score">
          <div class="score-text">Your score was</div>
          <var class="score-value">{Intl.NumberFormat().format(score)}</var>
        </div>

        {#if score > 0 && submissionStatus !== "success"}
          <form class="global-submit" onsubmit={handleGlobalSubmit}>
            <div class="input-label">
              Enter 3 Initials for Global (Optional)
            </div>
            <input
              type="text"
              class="initials-input"
              bind:value={username}
              maxlength="3"
              disabled={isSubmitting}
              autocomplete="off"
              data-1p-ignore
            />
            <button
              type="submit"
              disabled={isSubmitting ||
                (username.trim().length > 0 && username.trim().length !== 3)}
            >
              {isSubmitting ? "Submitting..." : "Submit Score"}
            </button>
            {#if submissionStatus === "error"}
              <span class="error-msg">Failed to submit!</span>
            {/if}
          </form>
        {/if}

        <Leaderboard
          bind:this={leaderboardRef}
          bind:activeTab={tab}
          highlightScore={score}
          leaderboardClient={gameState.leaderboard}
        />
      </div>
      <div class="screenshot"><GameScreenshot /></div>
    </div>

    <button onclick={handleStartClick}>Start New Game</button>
  </div>
</Modal>

<style>
  .heading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    font-size: 1em;
    margin: 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5em;
  }

  .score-value {
    display: block;
    text-align: center;
    font-size: 2em;
    font-weight: 500;
    color: rgb(49, 181, 82);
  }

  .score-and-screen {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    justify-items: center;
    gap: 1em;
  }

  .score {
    text-align: center;
  }

  .scores {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  .global-submit {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    align-items: center;
    padding: 1em;
    background: var(--color-background-light);
    border-radius: 8px;
    border: 1px solid var(--color-border);
  }

  .global-submit .input-label {
    font-size: 0.9em;
    color: var(--color-text-muted, #666);
    margin-bottom: 0.25em;
  }

  .initials-input {
    width: 6rem;
    padding: 0.25em;
    font-size: 1.5em;
    font-family: monospace;
    font-variant-numeric: tabular-nums;
    text-align: center;
    letter-spacing: 0.25em;
    border-radius: 8px;
    border: 2px solid var(--color-border);
    background: var(--color-background-light);
    color: var(--color-text);
    text-transform: uppercase;
  }

  .initials-input:focus {
    outline: var(--color-focus-outline) 2px solid;
    border-color: transparent;
  }

  .error-msg {
    color: red;
    font-size: 0.8em;
  }
</style>
