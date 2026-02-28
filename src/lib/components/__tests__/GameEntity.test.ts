import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import GameEntity from '../GameEntity.svelte';
import { GAME_WIDTH, GAME_WIDTH_PX } from '../../constants';
import { createRawSnippet } from 'svelte';

afterEach(() => {
	cleanup();
});

describe('GameEntity', () => {
	it('calculates correct translate style based on x and y', () => {
		const x = GAME_WIDTH / 2; // Middle of screen
		const y = GAME_WIDTH / 2;
		const expectedTranslateX = (x / GAME_WIDTH) * GAME_WIDTH_PX;
		const expectedTranslateY = (y / GAME_WIDTH) * GAME_WIDTH_PX;

		const { container } = render(GameEntity, {
			props: {
				x,
				y,
				rotation: 1,
				scale: 1,
				children: createRawSnippet(() => ({ render: () => `<div>entity</div>` }))
			}
		});

		const entity = container.querySelector('.game-entity') as HTMLElement;
		expect(entity).not.toBeNull();
		// Svelte handles style:translate combining the two, but test checks it directly
		expect(entity.style.translate).toBe(
			`calc(-50% + ${expectedTranslateX}px) calc(-50% + ${expectedTranslateY}px)`
		);
		expect(entity.style.rotate).toBe('1rad');
	});
});
