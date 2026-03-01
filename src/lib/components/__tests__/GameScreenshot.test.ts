import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/svelte';
import GameScreenshot from '../GameScreenshot.svelte';

afterEach(() => {
	cleanup();
});

describe('GameScreenshot', () => {
	it('shows loading indicator initially', () => {
		const { container } = render(GameScreenshot, {
			context: new Map([['generateScreenshot', async () => 'data:image/png;base64,stub']])
		});

		expect(container.textContent).toContain('Loading screenshot...');
	});

	it('renders image when screenshot is generated successfully', async () => {
		const { container } = render(GameScreenshot, {
			context: new Map([['generateScreenshot', async () => 'data:image/png;base64,stub']])
		});

		await waitFor(() => {
			const img = container.querySelector('img');
			expect(img).not.toBeNull();
			expect(img?.src).toContain('data:image');
		});
	});

	it('shows error message if generation fails', async () => {
		const { container } = render(GameScreenshot, {
			context: new Map([['generateScreenshot', async () => Promise.reject(new Error('error'))]])
		});

		await waitFor(() => {
			expect(container.textContent).toContain('Failed to generate screenshot.');
		});
	});
});
