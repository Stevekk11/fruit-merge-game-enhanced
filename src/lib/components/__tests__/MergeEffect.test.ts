import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import MergeEffect from '../MergeEffect.svelte';
import { GAME_WIDTH, GAME_WIDTH_PX } from '../../constants';

afterEach(() => {
	cleanup();
});

describe('MergeEffect', () => {
	it('renders with correct width calculation based on radius', () => {
		const radius = 2;
		const expectedWidth = (4 / GAME_WIDTH) * GAME_WIDTH_PX;

		const { container } = render(MergeEffect, {
			props: { radius }
		});

		const effect = container.querySelector('.merge-effect') as HTMLElement;
		expect(effect).not.toBeNull();
		expect(effect.style.width).toBe(`${expectedWidth}px`);
	});

	it('applies custom duration', () => {
		const { container } = render(MergeEffect, {
			props: { radius: 1, duration: 500 }
		});

		const effect = container.querySelector('.merge-effect') as HTMLElement;
		expect(effect.style.getPropertyValue('--duration')).toBe('500ms');
	});
});
