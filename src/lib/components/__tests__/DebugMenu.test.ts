import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import DebugMenu from '../DebugMenu.svelte';

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(() => {
	cleanup();
});

describe('DebugMenu', () => {
	it('collapses and expands', async () => {
		const { getByRole, queryByLabelText } = render(DebugMenu, {
			props: { gameState: {} as any }
		});

		expect(getByRole('button', { name: 'Hide' })).not.toBeNull();
		expect(queryByLabelText('Select Fruit:')).not.toBeNull();

		await fireEvent.click(getByRole('button', { name: 'Hide' }));

		expect(getByRole('button', { name: 'Show' })).not.toBeNull();
		expect(queryByLabelText('Select Fruit:')).toBeNull();
	});

	it('calls gameState functions when buttons are clicked', async () => {
		const dropFruit = vi.fn();
		const setStatus = vi.fn();

		const gameState = {
			status: 'playing',
			dropFruit,
			setStatus
		} as any;

		const { getByRole } = render(DebugMenu, {
			props: { gameState }
		});

		const dropBtn = getByRole('button', { name: 'Drop Fruit' });
		await fireEvent.click(dropBtn);
		expect(dropFruit).toHaveBeenCalled();

		const endBtn = getByRole('button', { name: 'End Game' });
		await fireEvent.click(endBtn);
		expect(setStatus).toHaveBeenCalledWith('gameover');
	});
});
