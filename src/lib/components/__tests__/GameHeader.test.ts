import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import GameHeader from '../GameHeader.svelte';

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(() => {
	cleanup();
});

describe('GameHeader', () => {
	it('toggles sound when mute button is clicked', async () => {
		const toggleMute = vi.fn();
		const gameState = {
			audioManager: {
				isMuted: false,
				toggleMute
			}
		} as any;

		const { getByRole } = render(GameHeader, {
			props: { gameState }
		});

		const toggleBtn = getByRole('button', { name: 'Toggle Sound' });
		await fireEvent.click(toggleBtn);

		expect(toggleMute).toHaveBeenCalled();
	});

	it('pauses game and opens IntroductionModal on About click', async () => {
		const setStatus = vi.fn();
		const gameState = {
			status: 'playing',
			setStatus,
			audioManager: { isMuted: false }
		} as any;

		const { getByRole } = render(GameHeader, {
			props: { gameState }
		});

		const aboutBtn = getByRole('button', { name: 'About' });
		await fireEvent.click(aboutBtn);

		expect(setStatus).toHaveBeenCalledWith('paused');
	});
});
