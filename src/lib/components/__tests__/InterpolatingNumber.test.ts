import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import InterpolatingNumber from '../InterpolatingNumber.svelte';

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(() => {
	cleanup();
});

describe('InterpolatingNumber', () => {
	it('renders the initial number correctly', () => {
		const { container } = render(InterpolatingNumber, { props: { number: 1000 } });
		expect(container.textContent?.trim()).toBe('1,000');
	});
});
