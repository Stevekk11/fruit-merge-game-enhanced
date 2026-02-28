import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import Modal from '../Modal.svelte';
import { createRawSnippet } from 'svelte';

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(() => {
	cleanup();
});

describe('Modal', () => {
	it('does not render when open is false', () => {
		const { container } = render(Modal, {
			props: {
				open: false,
				title: 'Test Modal',
				onClose: vi.fn(),
				children: createRawSnippet(() => ({
					render: () => `<div data-testid="child">content</div>`
				}))
			}
		});
		expect(container.querySelector('.modal-wrapper')).toBeNull();
	});

	it('renders when open is true', () => {
		const { container } = render(Modal, {
			props: {
				open: true,
				title: 'Test Modal',
				onClose: vi.fn(),
				children: createRawSnippet(() => ({
					render: () => `<div data-testid="child">content</div>`
				}))
			}
		});
		expect(container.querySelector('.modal-wrapper')).not.toBeNull();
	});

	it('calls onClose when close button is clicked', async () => {
		const onClose = vi.fn();
		const { container } = render(Modal, {
			props: {
				open: true,
				title: 'Test Modal',
				onClose,
				children: createRawSnippet(() => ({
					render: () => `<div data-testid="child">content</div>`
				}))
			}
		});

		const closeBtn = container.querySelector('.close-button');
		await fireEvent.click(closeBtn!);
		expect(onClose).toHaveBeenCalled();
	});

	it('calls onClose when Escape key is pressed', async () => {
		const onClose = vi.fn();
		render(Modal, {
			props: {
				open: true,
				title: 'Test Modal',
				onClose,
				children: createRawSnippet(() => ({
					render: () => `<div data-testid="child">content</div>`
				}))
			}
		});

		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(onClose).toHaveBeenCalled();
	});
});
