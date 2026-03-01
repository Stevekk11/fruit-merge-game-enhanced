import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/svelte';
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
				username: null,
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
			dailyScores: [],
			dailyScoresStatus: 'idle',
			overallScores: [],
			overallScoresStatus: 'idle',
			fetchDailyScores: vi.fn(),
			fetchOverallScores: vi.fn(),
			editToken: null,
			submittedId: null,
			submittedRank: null,
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
	it('renders the modal heading when open', async () => {
		const gameState = makeGameState();
		const { container } = render(GameOverModal, {
			props: { open: true, score: 1500, onClose: vi.fn(), gameState }
		});
		await waitFor(() => {
			expect(container.querySelector('.heading')?.textContent?.trim()).toContain(
				'Thanks for playing!'
			);
		});
	});

	it('auto-submits score on open when submissionStatus is idle', async () => {
		const submitScore = vi.fn().mockResolvedValue({ success: true });
		const gameState = makeGameState({
			leaderboard: {
				submissionStatus: 'idle',
				sessionToken: 'mock-token',
				submitScore,
				dailyScores: [],
				dailyScoresStatus: 'idle',
				overallScores: [],
				overallScoresStatus: 'idle',
				fetchDailyScores: vi.fn(),
				fetchOverallScores: vi.fn(),
				editToken: null,
				submittedId: null,
				submittedRank: null
			}
		});

		render(GameOverModal, {
			props: { open: true, score: 1500, onClose: vi.fn(), gameState }
		});

		await waitFor(() => {
			expect(gameState.telemetry.buildSubmissionPayload).toHaveBeenCalled();
			expect(submitScore).toHaveBeenCalled();
		});
	});

	it('does not auto-submit when submissionStatus is already success', async () => {
		const submitScore = vi.fn().mockResolvedValue({ success: true });
		const gameState = makeGameState({
			leaderboard: {
				submissionStatus: 'success',
				sessionToken: 'mock-token',
				submitScore,
				dailyScores: [],
				dailyScoresStatus: 'success',
				overallScores: [],
				overallScoresStatus: 'idle',
				fetchDailyScores: vi.fn(),
				fetchOverallScores: vi.fn(),
				editToken: null,
				submittedId: null,
				submittedRank: null
			}
		});

		render(GameOverModal, {
			props: { open: true, score: 1500, onClose: vi.fn(), gameState }
		});

		// Give effects time to run
		await new Promise((r) => setTimeout(r, 50));

		expect(submitScore).not.toHaveBeenCalled();
	});

	it('does not auto-submit when there is no session token', async () => {
		const submitScore = vi.fn().mockResolvedValue({ success: true });
		const gameState = makeGameState({
			leaderboard: {
				submissionStatus: 'idle',
				sessionToken: null,
				submitScore,
				dailyScores: [],
				dailyScoresStatus: 'idle',
				overallScores: [],
				overallScoresStatus: 'idle',
				fetchDailyScores: vi.fn(),
				fetchOverallScores: vi.fn(),
				editToken: null,
				submittedId: null,
				submittedRank: null
			}
		});

		render(GameOverModal, {
			props: { open: true, score: 1500, onClose: vi.fn(), gameState }
		});

		await new Promise((r) => setTimeout(r, 50));

		expect(submitScore).not.toHaveBeenCalled();
	});

	it('is not visible when open is false', () => {
		const { container } = render(GameOverModal, {
			props: { open: false, score: 0, onClose: vi.fn(), gameState: null }
		});
		expect(container.querySelector('.heading')).toBeNull();
	});

	it('uses stored initials from localStorage in auto-submit payload', async () => {
		window.localStorage.setItem('subak_initials', 'ABC');

		const buildSubmissionPayload = vi.fn().mockResolvedValue({ finalScore: 1500 });
		const gameState = makeGameState({ telemetry: { buildSubmissionPayload } });

		render(GameOverModal, {
			props: { open: true, score: 1500, onClose: vi.fn(), gameState }
		});

		await waitFor(() => {
			expect(buildSubmissionPayload).toHaveBeenCalledWith('ABC', 1500, 'mock-token');
		});

		window.localStorage.removeItem('subak_initials');
	});
});
