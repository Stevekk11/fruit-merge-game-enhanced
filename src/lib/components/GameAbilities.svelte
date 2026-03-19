<script lang="ts">
    const {gameState} = $props();

    let shakeButtonRef: HTMLButtonElement | null = null;
	let bombButtonRef: HTMLButtonElement | null = null;

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

    .ability-button {
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
</style>
