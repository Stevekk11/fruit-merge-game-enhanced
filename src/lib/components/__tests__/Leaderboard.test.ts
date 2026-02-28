import { render, fireEvent, waitFor, cleanup } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Leaderboard from '../Leaderboard.svelte';

const LOCAL_SCORES = [
	{ id: 1, score: 1200, date: new Date('2024-01-01') },
	{ id: 2, score: 800, date: new Date('2024-01-02') }
];

const GLOBAL_SCORES = {
	scores: [
		{ id: 10, score: 5000, created_at: '2024-03-01T00:00:00Z' },
		{ id: 11, score: 3000, created_at: '2024-03-02T00:00:00Z' }
	]
};

let mockFetch: ReturnType<typeof vi.fn>;

beforeEach(() => {
	mockFetch = vi.fn().mockResolvedValue({
		ok: true,
		json: async () => GLOBAL_SCORES
	});
	vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe('Leaderboard component', () => {
	it('renders provided local scores', () => {
		const { container } = render(Leaderboard, { props: { localScores: LOCAL_SCORES } });
		const rows = container.querySelectorAll('tbody tr');
		expect(rows.length).toBe(LOCAL_SCORES.length);
		const firstRow = rows[0] as HTMLElement;
		expect(firstRow.querySelector('.rank')?.textContent).toBe('1');
		expect(firstRow.querySelector('.score')?.textContent).toContain('1,200');
	});

	it('shows empty state when no scores provided', () => {
		const { container } = render(Leaderboard, { props: { localScores: [] } });
		expect(container.querySelector('.empty')?.textContent).toContain('No scores yet');
	});

	it('highlights a score row', async () => {
		const longScores = Array.from({ length: 15 }, (_, i) => ({
			id: i + 1,
			score: 1000 - i * 10,
			date: new Date()
		}));
		const highlight = longScores[5].score;
		const { container } = render(Leaderboard, {
			props: { localScores: longScores, highlightScore: highlight }
		});

		await waitFor(() => {
			const row = container.querySelector(`tr[data-score="${highlight}"]`);
			expect(row?.classList.contains('highlight')).toBe(true);
		});
	});

	it('switches to global tab and fetches global scores', async () => {
		const { getAllByRole, container } = render(Leaderboard, {
			props: { localScores: LOCAL_SCORES }
		});

		// Click the first "Global" tab button within this rendered instance
		await fireEvent.click(getAllByRole('button', { name: /^global$/i })[0]);

		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/leaderboard'));
		});

		await waitFor(() => {
			const rows = container.querySelectorAll('tbody tr');
			expect(rows.length).toBe(GLOBAL_SCORES.scores.length);
			expect(rows[0].querySelector('.score')?.textContent).toContain('5,000');
		});
	});

	it('switches back to local tab after viewing global', async () => {
		const { getAllByRole, container } = render(Leaderboard, {
			props: { localScores: LOCAL_SCORES }
		});

		await fireEvent.click(getAllByRole('button', { name: /^global$/i })[0]);
		await waitFor(() => expect(mockFetch).toHaveBeenCalled());

		await fireEvent.click(getAllByRole('button', { name: /^local data$/i })[0]);
		await waitFor(() => {
			const rows = container.querySelectorAll('tbody tr');
			expect(rows.length).toBe(LOCAL_SCORES.length);
		});
	});
});
