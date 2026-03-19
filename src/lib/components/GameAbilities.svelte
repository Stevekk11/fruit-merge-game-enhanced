<script lang="ts">
	import {FRUITS} from '../constants';

	const {gameState} = $props();

	let shakeButtonRef: HTMLButtonElement | null = null;
	let bombButtonRef: HTMLButtonElement | null = null;
	let popAllButtonRef: HTMLButtonElement | null = null;
	let showFruitSelector = $state(false);

	function handleShakeClick() {
		if (gameState && gameState.shakesRemaining > 0 && gameState.status === 'playing') {
			gameState.useShake();

			// Visual feedback: brief scale animation on button
			if (shakeButtonRef) {
				shakeButtonRef.classList.add('activated');
				setTimeout(() => {
					shakeButtonRef?.classList.remove('activated');
				}, 200);
			}
		}
	}

	function handleBombClick() {
		if (gameState && gameState.bombsRemaining > 0 && gameState.status === 'playing') {
			gameState.useBomb();

			// Visual feedback: brief scale animation on button
			if (bombButtonRef) {
				bombButtonRef.classList.add('activated');
				setTimeout(() => {
					bombButtonRef?.classList.remove('activated');
				}, 200);
			}
		}
	}

	function handlePopAllClick() {
		if (gameState && gameState.popAllRemaining > 0 && gameState.status === 'playing') {
			showFruitSelector = !showFruitSelector;
		}
	}

	function selectFruitType(fruitIndex: number) {
		if (gameState && gameState.popAllRemaining > 0 && gameState.status === 'playing') {
			gameState.usePopAll(fruitIndex);
			showFruitSelector = false;

			// Visual feedback: brief scale animation on button
			if (popAllButtonRef) {
				popAllButtonRef.classList.add('activated');
				setTimeout(() => {
					popAllButtonRef?.classList.remove('activated');
				}, 200);
			}
		}
	}
</script>

<div class="abilities-content">
	<section class="abilities-section">
		<h5 class="section__heading">Abilities</h5>

		<div class="abilities-grid">
			<!-- Shake Ability -->
			<button
					class="ability-button shake-button"
					class:disabled={gameState?.shakesRemaining === 0 || gameState?.status !== 'playing'}
					class:shaking={gameState?.isShaking}
					onclick={handleShakeClick}
					bind:this={shakeButtonRef}
					aria-label={`Shake ability. Remaining: ${gameState?.shakesRemaining ?? 0}`}
					title="Shake the game area to help merge fruits"
			>
				<div class="ability-icon">
					<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<div class="ability-label">Shake</div>
				<div class="ability-count">
					{gameState?.shakesRemaining ?? 0}/3
				</div>
			</button>

			<!-- Bomb Ability -->
			<button
					class="ability-button bomb-button"
					class:disabled={gameState?.bombsRemaining === 0 || gameState?.status !== 'playing'}
					onclick={handleBombClick}
					bind:this={bombButtonRef}
					aria-label={`Bomb ability. Remaining: ${gameState?.bombsRemaining ?? 0}`}
					title="Drop a bomb to destroy all fruits it hits"
			>
				<div class="ability-icon">
					<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="9"/>
						<circle cx="12" cy="12" r="6" fill="currentColor"/>
						<path d="M12 4v2M12 18v2" stroke-linecap="round"/>
					</svg>
				</div>
				<div class="ability-label">Bomb</div>
				<div class="ability-count">
					{gameState?.bombsRemaining ?? 0}/2
				</div>
			</button>

			<!-- Pop All Ability -->
			<div class="ability-wrapper">
				<button
						class="ability-button pop-all-button"
						class:disabled={gameState?.popAllRemaining === 0 || gameState?.status !== 'playing'}
						class:active={showFruitSelector}
						onclick={handlePopAllClick}
						bind:this={popAllButtonRef}
						aria-label={`Pop all ability. Remaining: ${gameState?.popAllRemaining ?? 0}`}
						title="Select a fruit type to destroy all fruits of that type"
				>
					<div class="ability-icon">
						<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
							 stroke-width="2">
							<circle cx="12" cy="12" r="8"/>
							<path d="M12 8v8M8 12h8" stroke-linecap="round"/>
						</svg>
					</div>
					<div class="ability-label">Pop All</div>
					<div class="ability-count">
						{gameState?.popAllRemaining ?? 0}/2
					</div>
				</button>

				<!-- Fruit Type Selector Modal -->
				{#if showFruitSelector && gameState?.status === 'playing'}
					<div class="fruit-selector" role="menu">
						{#each FRUITS as fruit, index}
							<button
									class="fruit-option"
									style:color={`var(--color-${fruit.name})`}
									onclick={() => selectFruitType(index)}
									aria-label={`Pop all ${fruit.name}`}
									title={fruit.name}
							>
								<div class="fruit-color-indicator" style:background={`var(--color-${fruit.name})`}/>
								<span class="fruit-name">{fruit.name}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</section>
</div>

<style>
	.abilities-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		height: 100%;
		overflow-y: auto;
	}

	.abilities-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.section__heading {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-light-text);
	}

	.abilities-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
	}

	.ability-wrapper {
		position: relative;
		width: 100%;
	}

	.ability-button {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1.25rem 1rem;
		border: 2px solid var(--color-border);
		border-radius: 0.75rem;
		background: var(--color-background);
		color: var(--color-text);
		font-family: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 150ms ease-out;
		touch-action: manipulation;

		&:not(.disabled):hover {
			border-color: var(--color-focus-outline);
			background: var(--color-background-light);
			transform: translateY(-1px);
			box-shadow: 0 2px 8px rgba(2, 191, 96, 0.15);
		}

		&:not(.disabled):active {
			transform: translateY(0);
		}

		&.disabled {
			opacity: 0.5;
			cursor: not-allowed;
			border-color: var(--color-border-light);
		}

		&.shaking {
			animation: shake-button 0.3s ease-in-out;
		}

		&.activated {
			animation: button-pop 0.2s ease-out;
		}

		&.active {
			border-color: var(--color-focus-outline);
			background: var(--color-background-light);
		}
	}

	@keyframes shake-button {
		0%, 100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-4px);
		}
		75% {
			transform: translateX(4px);
		}
	}

	@keyframes button-pop {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
		}
	}

	.ability-icon {
		font-size: 1.5rem;
		color: var(--color-focus-outline);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
	}

	.ability-label {
		font-size: 0.9rem;
		font-weight: 700;
		text-align: center;
	}

	.ability-count {
		font-size: 0.75rem;
		color: var(--color-light-text);
		font-weight: 600;
		text-align: center;
	}

	.fruit-selector {
		position: fixed;
		right: 155px;
		top: 50%;
		transform: translateY(-50%);
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
		padding: 1.25rem;
		background: var(--color-background);
		border: 2px solid var(--color-border);
		border-radius: 1rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		z-index: 50;
		width: 280px;
	}

	.fruit-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.75rem 0.5rem;
		border: 2px solid var(--color-border);
		border-radius: 0.65rem;
		background: var(--color-background-light);
		color: var(--color-text);
		font-size: 0.65rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 120ms ease-out;
		text-transform: capitalize;
		min-height: 50px;

		&:hover {
			border-color: var(--color-focus-outline);
			background: var(--color-background);
			transform: translateY(-2px);
			box-shadow: 0 3px 10px rgba(2, 191, 96, 0.15);
		}

		&:active {
			transform: scale(0.92);
		}
	}

	.fruit-name {
		display: block;
		text-align: center;
		word-break: break-word;
		font-size: 0.6rem;
	}

	.fruit-color-indicator {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: currentColor;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
	}
</style>
