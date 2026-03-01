import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import CircleOfEvolution from '../CircleOfEvolution.svelte';
import { FRUITS } from '../../constants';

afterEach(() => {
	cleanup();
});

describe('CircleOfEvolution', () => {
	it('renders all fruits defined in constants', () => {
		const { container } = render(CircleOfEvolution);

		const renderedFruits = container.querySelectorAll('.fruit');
		expect(renderedFruits.length).toBe(FRUITS.length);
	});
});
