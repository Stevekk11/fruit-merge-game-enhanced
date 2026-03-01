import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import RollingNumber from '../RollingNumber.svelte';

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(() => {
	cleanup();
});

describe('RollingNumber', () => {
	it('renders without errors', () => {
		const { container } = render(RollingNumber, { props: { number: 1000 } });
		expect(container).not.toBeNull();
	});

	it('renders a number-flow-svelte custom element', () => {
		const { container } = render(RollingNumber, { props: { number: 42 } });
		const numberFlow = container.querySelector('number-flow-svelte');
		expect(numberFlow).not.toBeNull();
	});
});
