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

let tab = $state<'daily' | 'overall' | 'local'>('daily');

$effect(() => {
	if (open && gameState.leaderboard.submissionStatus === 'idle') {
		autoSubmit();
	}
});

async function autoSubmit() {
	const token = gameState.leaderboard.sessionToken;
	if (!token) return;

	const storedUsername =
		typeof window !== 'undefined' ? window.localStorage.getItem('subak_initials') || null : null;

	const payload = await gameState.telemetry.buildSubmissionPayload(storedUsername, score, token);
	if (payload) await gameState.leaderboard.submitScore(payload);
}

async function handleClose() {
	await gameState.leaderboard.submitPendingUsername();
	onClose();
}

function handleStartClick() {
	handleClose();
}
</script>

{#snippet append()}
  <ModalCreditsFooter />
{/snippet}

<Modal {open} onClose={handleClose} {append} title="Game Over">
  <div class="content">
    <h2 class="heading">Thanks for playing!</h2>

    <div class="score-and-screen">
      <Leaderboard bind:activeTab={tab} leaderboardClient={gameState.leaderboard} />
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

  .score-and-screen {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    justify-items: center;
    gap: 1em;
    width: 100%;
  }
</style>
