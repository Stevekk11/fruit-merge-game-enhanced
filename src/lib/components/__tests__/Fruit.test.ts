import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Fruit from '../Fruit.svelte';
import { GAME_WIDTH, GAME_WIDTH_PX } from '../../constants';

afterEach(() => {
	cleanup();
});

describe('Fruit', () => {
	it('renders correctly with given name and radius', () => {
		const { container } = render(Fruit, {
			props: { name: 'apple', radius: 1 }
		});

		const fruitDiv = container.querySelector('.fruit') as HTMLElement;
		expect(fruitDiv).not.toBeNull();
		expect(fruitDiv.getAttribute('data-name')).toBe('apple');

		// The width calculation is based on radius and game width
		const expectedWidth = (2 / GAME_WIDTH) * GAME_WIDTH_PX;
		expect(fruitDiv.style.width).toBe(`${expectedWidth}px`);
	});

	it('accepts string radius without calculation', () => {
		const { container } = render(Fruit, {
			props: { name: 'orange', radius: '2em' }
		});

		const fruitDiv = container.querySelector('.fruit') as HTMLElement;
		expect(fruitDiv.style.width).toBe('2em');
	});

	it('renders invalid fruit name gracefully', () => {
		const { container } = render(Fruit, {
			props: { name: 'invalid-fruit', radius: 1 }
		});
		const fruitDiv = container.querySelector('.fruit') as HTMLElement;
		// Just the wrapper should be there, SVG might not render but shouldn't crash
		expect(fruitDiv).not.toBeNull();
	});
});
