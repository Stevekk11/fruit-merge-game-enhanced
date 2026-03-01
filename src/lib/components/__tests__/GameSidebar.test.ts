import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import GameSidebar from '../GameSidebar.svelte';
import { FRUITS } from '../../constants';

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(() => {
	cleanup();
});

describe('GameSidebar', () => {
	it('renders score derived from gameState', () => {
		const gameState = {
			score: 4200,
			nextFruitIndex: 0,
			dropCount: 0
		};

		const { container } = render(GameSidebar, {
			props: { gameState }
		});

		const scoreTexts = container.querySelectorAll('.score');
		expect(scoreTexts.length).toBeGreaterThan(0);
		// Assuming InterpolatingNumber formats it
		expect(scoreTexts[0].textContent).toContain('4,200');
	});

	it('renders correctly even if gameState is null initially', () => {
		// Just verify it doesn't crash
		const { container } = render(GameSidebar, {
			props: { gameState: null }
		});

		expect(container.textContent).toContain('Score');
		expect(container.textContent).toContain('Next');
		expect(container.textContent).toContain('Cycle');
	});

	it('renders next fruit based on nextFruitIndex', () => {
		const gameState = {
			score: 0,
			nextFruitIndex: 1, // Let's use Grape assuming Blueberry is 0
			dropCount: 1
		};

		const { container } = render(GameSidebar, {
			props: { gameState }
		});

		const nextFruitWrapper = container.querySelector('.next-fruit');
		expect(nextFruitWrapper).not.toBeNull();
		const fruit = nextFruitWrapper?.querySelector('.fruit') as HTMLElement;
		expect(fruit.getAttribute('data-name')).toBe(FRUITS[1].name);
	});
});
