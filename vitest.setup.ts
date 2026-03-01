import { vi } from 'vitest';

vi.mock('howler', () => ({
	Howl: vi.fn(() => ({ play: vi.fn(), stop: vi.fn() })),
	Howler: { ctx: { state: 'running' }, _muted: false }
}));

vi.mock('svelte/motion', () => ({
	Tween: {
		of: (getter: () => number) => ({ current: getter() })
	}
}));

// --- Mock database access ---------------------------------------------------
const mockScores: { id: number; score: number; date: Date }[] = [];

vi.mock('./src/lib/stores/db', () => ({
	saveScore: vi.fn(async (score: number) => {
		mockScores.push({ id: mockScores.length + 1, score, date: new Date() });
	}),
	getHighScores: vi.fn(async () => {
		return [...mockScores].sort((a, b) => b.score - a.score).slice(0, 10);
	}),
	__mockScores: mockScores
}));
