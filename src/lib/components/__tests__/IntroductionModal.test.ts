import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import IntroductionModal from '../IntroductionModal.svelte';

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(() => {
	cleanup();
});

describe('IntroductionModal', () => {
	it('shows Start Game button initially', () => {
		const { getByRole } = render(IntroductionModal, {
			props: { open: true, gameStatus: 'idle', onClose: vi.fn() }
		});
		expect(getByRole('button', { name: 'Start Game' })).not.toBeNull();
	});

	it('shows Resume Game button when paused', () => {
		const { getByRole } = render(IntroductionModal, {
			props: { open: true, gameStatus: 'paused', onClose: vi.fn() }
		});
		expect(getByRole('button', { name: 'Resume Game' })).not.toBeNull();
	});

	it('shows Start New Game button when gameover', () => {
		const { getByRole } = render(IntroductionModal, {
			props: { open: true, gameStatus: 'gameover', onClose: vi.fn() }
		});
		expect(getByRole('button', { name: 'Start New Game' })).not.toBeNull();
	});

	it('calls onClose when button is clicked', async () => {
		const onClose = vi.fn();
		const { getByRole } = render(IntroductionModal, {
			props: { open: true, gameStatus: 'idle', onClose }
		});
		const button = getByRole('button', { name: 'Start Game' });
		await fireEvent.click(button);
		expect(onClose).toHaveBeenCalled();
	});
});
