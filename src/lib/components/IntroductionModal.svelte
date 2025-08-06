<script lang="ts">
	import { onMount } from 'svelte';

	import { getHighScores } from '../stores/db';

	import Modal from './Modal.svelte';
	import Leaderboard from './Leaderboard.svelte';
	import Fruit from './Fruit.svelte';
	import ModalCreditsFooter from './ModalCreditsFooter.svelte';

	const { open, gameStatus, onClose } = $props();

	let highScores = $state([]);

	onMount(async () => {
		highScores = await getHighScores();
	});

	function handleStartClick() {
		onClose();
	}

	const startButtonText = $derived.by(() => {
		switch (gameStatus) {
			case 'gameover':
				return 'Start New Game';

			case 'paused':
				return 'Resume Game';

			case 'uninitialized':
			default:
				return 'Start Game';
		}
	});
</script>

{#snippet append()}<ModalCreditsFooter />{/snippet}

<Modal {open} {onClose} {append}>
	<div class="content">
		<header class="header">
			<div class="game-logo">
				<div class="game-logo__fruits">
					<Fruit name="orange" radius="1.5em" />
					<Fruit name="watermelon" radius="4em" />
					<Fruit name="apple" radius="2em" />
				</div>
				<h2 class="heading">Subak Game</h2>
			</div>

			<div>
				Match fruits <Fruit name="lemon" radius="1em" display="inline" /> to merge them into a bigger
				fruit
				<Fruit name="orange" radius="1em" display="inline" />.<br />Try to get to a <Fruit
					name="watermelon"
					radius="1em"
					display="inline" />!
			</div>
		</header>
		<hr />
		<section class="leaderboard">
			<Leaderboard scores={highScores} />
		</section>
		<button onclick={handleStartClick}>{startButtonText}</button>
	</div>
</Modal>

<style>
	.game-logo {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.game-logo__fruits {
		display: flex;
		align-items: end;
	}

	.heading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5em;
		font-size: 2em;
		margin: 0;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5em;
	}

	.header {
		padding-top: 1.5em;
		display: flex;
		flex-direction: column;
		gap: 1em;
	}
</style>
