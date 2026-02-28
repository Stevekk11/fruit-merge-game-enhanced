<script lang="ts">
import Modal from './Modal.svelte';
import Leaderboard from './Leaderboard.svelte';
import ModalCreditsFooter from './ModalCreditsFooter.svelte';
import GameScreenshot from './GameScreenshot.svelte';

const { open, score, onClose, gameState } = $props();

let tab = $state<'local' | 'global'>('local');
let username = $state('');
let isSubmitting = $state(false);
let submissionStatus = $state<'idle' | 'success' | 'error'>('idle');

let leaderboardRef: ReturnType<typeof Leaderboard> | null = $state(null);

$effect(() => {
	if (open && tab === 'local' && leaderboardRef) {
		leaderboardRef.fetchLocalScores();
	}
});

async function handleGlobalSubmit(e: Event) {
	e.preventDefault();
	if (!username.trim() || !gameState || isSubmitting) return;

	isSubmitting = true;
	const res = await gameState.telemetry.submitGlobalScore(username.trim(), gameState.score);
	isSubmitting = false;

	if (res.success) {
		submissionStatus = 'success';
		// refresh global scores and swap tab
		if (leaderboardRef) {
			await leaderboardRef.fetchGlobalScores();
		}
		tab = 'global';
	} else {
		submissionStatus = 'error';
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

				{#if gameState && submissionStatus !== 'success'}
					<form class="global-submit" onsubmit={handleGlobalSubmit}>
						<input
							type="text"
							bind:value={username}
							placeholder="Enter name for global"
							maxlength="20"
							required
							disabled={isSubmitting} />
						<button type="submit" disabled={isSubmitting || !username.trim()}>
							{isSubmitting ? 'Submitting...' : 'Submit Score'}
						</button>
						{#if submissionStatus === 'error'}
							<span class="error-msg">Failed to submit!</span>
						{/if}
					</form>
				{/if}

				<Leaderboard bind:this={leaderboardRef} bind:activeTab={tab} highlightScore={score} />
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
		background: var(--color-background-light, #f9f9f9);
		border-radius: 8px;
		border: 1px solid var(--color-border, #ccc);
	}

	.global-submit input {
		padding: 0.5em;
		border-radius: 4px;
		border: 1px solid #ccc;
		text-align: center;
	}

	.error-msg {
		color: red;
		font-size: 0.8em;
	}

	.error-msg {
		color: red;
		font-size: 0.8em;
	}
</style>
