import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/svelte';
import GameOverModal from '../GameOverModal.svelte';

// Stub GameScreenshot — uses getContext which isn't available outside Game.svelte tree
vi.mock('../GameScreenshot.svelte', async () => {
	const { default: stub } = await import('../../../__mocks__/GameScreenshot.svelte');
	return { default: stub };
});

const makeGameState = (overrides: Record<string, unknown> = {}) => ({
	score: 1500,
	telemetry: {
		submitGlobalScore: vi.fn().mockResolvedValue({ success: true }),
		...((overrides.telemetry as object) ?? {})
	},
	...overrides
});

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(() => {
	cleanup();
});

describe('GameOverModal', () => {
	it('renders the formatted final score when open', async () => {
		const gameState = makeGameState();
		const { container } = render(GameOverModal, {
			props: { open: true, score: 1500, onClose: vi.fn(), gameState }
		});
		await waitFor(() => {
			expect(container.querySelector('.score-value')?.textContent?.trim()).toContain('1,500');
		});
	});

	it('shows the global submission form when gameState is provided and not yet submitted', async () => {
		const gameState = makeGameState();
		const { container } = render(GameOverModal, {
			props: { open: true, score: 1500, onClose: vi.fn(), gameState }
		});
		await waitFor(() => {
			expect(container.querySelector('.global-submit')).not.toBeNull();
			expect(container.querySelector('input[type="text"]')).not.toBeNull();
		});
	});

	it('hides the submission form after successful submit', async () => {
		const gameState = makeGameState();
		const { container, getAllByRole, getByPlaceholderText } = render(GameOverModal, {
			props: { open: true, score: 1500, onClose: vi.fn(), gameState }
		});

		await fireEvent.input(getByPlaceholderText(/enter name/i), {
			target: { value: 'Player1' }
		});

		const submitBtn = getAllByRole('button', { name: /submit score/i })[0];
		await fireEvent.click(submitBtn);

		await waitFor(() => {
			expect(container.querySelector('.global-submit')).toBeNull();
		});
	});

	it('shows error message on failed submission', async () => {
		const gameState = makeGameState({
			telemetry: {
				submitGlobalScore: vi.fn().mockResolvedValue({ success: false, error: 'Bad request' })
			}
		});
		const { container, getAllByRole, getByPlaceholderText } = render(GameOverModal, {
			props: { open: true, score: 1500, onClose: vi.fn(), gameState }
		});

		await fireEvent.input(getByPlaceholderText(/enter name/i), {
			target: { value: 'Player1' }
		});

		await fireEvent.click(getAllByRole('button', { name: /submit score/i })[0]);

		await waitFor(() => {
			expect(container.querySelector('.error-msg')).not.toBeNull();
		});
	});

	it('is not visible when open is false', () => {
		const { container } = render(GameOverModal, {
			props: { open: false, score: 0, onClose: vi.fn(), gameState: null }
		});
		expect(container.querySelector('.score-value')).toBeNull();
	});
});
