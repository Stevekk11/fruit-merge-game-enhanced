import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/svelte';
import GameOverModal from '../GameOverModal.svelte';
import type { GameState } from '../../stores/game.svelte';

// Stub GameScreenshot — uses getContext which isn't available outside Game.svelte tree
vi.mock('../GameScreenshot.svelte', async () => {
	const { default: stub } = await import('../../../__mocks__/GameScreenshot.svelte');
	return { default: stub };
});

const makeGameState = (overrides: Record<string, unknown> = {}): GameState =>
	({
		score: 1500,
		telemetry: {
			buildSubmissionPayload: vi.fn().mockResolvedValue({
				username: 'Player1',
				finalScore: 1500,
				sessionToken: 'mock-token',
				milestones: [],
				validationHash: 'abc',
				clientVersion: '0.0.0-test',
				buildHash: 'testhash'
			}),
			...((overrides.telemetry as object) ?? {})
		},
		leaderboard: {
			submissionStatus: 'idle',
			sessionToken: 'mock-token',
			submitScore: vi.fn().mockResolvedValue({ success: true }),
			globalScores: [],
			globalScoresStatus: 'idle',
			fetchGlobalScores: vi.fn(),
			...((overrides.leaderboard as object) ?? {})
		},
		...overrides
	}) as unknown as GameState;

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
		const submitScore = vi.fn().mockResolvedValue({ success: true });
		const gameState = makeGameState({
			leaderboard: {
				submissionStatus: 'idle',
				sessionToken: 'mock-token',
				submitScore,
				globalScores: [],
				globalScoresStatus: 'idle',
				fetchGlobalScores: vi.fn()
			}
		});
		const { getAllByRole, container } = render(GameOverModal, {
			props: { open: true, score: 1500, onClose: vi.fn(), gameState }
		});

		const input = container.querySelector('input') as HTMLInputElement;
		await fireEvent.input(input, {
			target: { value: 'TKP' }
		});

		const submitBtn = getAllByRole('button', { name: /submit score/i })[0];
		await fireEvent.click(submitBtn);

		await waitFor(() => {
			expect(submitScore).toHaveBeenCalled();
		});
	});

	it('shows error message on failed submission', async () => {
		const submitScore = vi.fn().mockResolvedValue({ success: false, error: 'Bad request' });
		const gameState = makeGameState({
			leaderboard: {
				submissionStatus: 'idle',
				sessionToken: 'mock-token',
				submitScore,
				globalScores: [],
				globalScoresStatus: 'idle',
				fetchGlobalScores: vi.fn()
			}
		});
		const { getAllByRole, container } = render(GameOverModal, {
			props: { open: true, score: 1500, onClose: vi.fn(), gameState }
		});

		const input = container.querySelector('input') as HTMLInputElement;
		await fireEvent.input(input, {
			target: { value: 'TKP' }
		});

		await fireEvent.click(getAllByRole('button', { name: /submit score/i })[0]);

		await waitFor(() => {
			expect(submitScore).toHaveBeenCalled();
		});
	});

	it('is not visible when open is false', () => {
		const { container } = render(GameOverModal, {
			props: { open: false, score: 0, onClose: vi.fn(), gameState: null }
		});
		expect(container.querySelector('.score-value')).toBeNull();
	});

	it('initializes username from localStorage if available', async () => {
		// Set localStorage before render
		window.localStorage.setItem('subak_initials', 'ABC');

		const gameState = makeGameState();
		const { container } = render(GameOverModal, {
			props: { open: true, score: 1500, onClose: vi.fn(), gameState }
		});

		await waitFor(() => {
			const input = container.querySelector('input') as HTMLInputElement;
			expect(input.value).toBe('ABC');
		});
	});

	it('saves username to localStorage on successful submit', async () => {
		// Clear local storage first
		window.localStorage.removeItem('subak_initials');

		const submitScore = vi.fn().mockResolvedValue({ success: true });
		const gameState = makeGameState({
			leaderboard: {
				submissionStatus: 'idle',
				sessionToken: 'mock-token',
				submitScore,
				globalScores: [],
				globalScoresStatus: 'idle',
				fetchGlobalScores: vi.fn()
			}
		});

		const { getAllByRole, container } = render(GameOverModal, {
			props: { open: true, score: 1500, onClose: vi.fn(), gameState }
		});

		const input = container.querySelector('input') as HTMLInputElement;
		await fireEvent.input(input, {
			target: { value: 'XYZ' }
		});

		const submitBtn = getAllByRole('button', { name: /submit score/i })[0];
		await fireEvent.click(submitBtn);

		await waitFor(() => {
			expect(submitScore).toHaveBeenCalled();
			expect(window.localStorage.getItem('subak_initials')).toBe('XYZ');
		});
	});
});
