import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import { GameState } from '../../stores/game.svelte.js';
import Game from '../Game.svelte';

// GameScreenshot uses getContext — stub it to avoid context errors
vi.mock('../GameScreenshot.svelte', async () => {
	const { default: stub } = await import('../../../__mocks__/GameScreenshot.svelte');
	return { default: stub };
});

const proto = GameState.prototype as any;

beforeEach(() => {
	// Prevent real physics/audio init; set status to 'playing' as default
	vi.spyOn(proto, 'init').mockImplementation(async function (this: any) {
		this.audioManager = { isMuted: false, toggleMute: vi.fn() };
		this.status = 'playing';
	});
	vi.spyOn(proto, 'destroy').mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
	cleanup();
});

function getBeforeUnloadHandler(addSpy: ReturnType<typeof vi.spyOn>) {
	const call = (addSpy.mock.calls as [string, EventListener][]).find(
		([type]) => type === 'beforeunload'
	);
	return call?.[1] as ((event: Partial<BeforeUnloadEvent>) => void) | undefined;
}

describe('Game beforeunload guard', () => {
	it('calls preventDefault when game is in progress', () => {
		const addSpy = vi.spyOn(window, 'addEventListener');
		render(Game);

		const handler = getBeforeUnloadHandler(addSpy);
		const event = { preventDefault: vi.fn() };
		handler?.(event);

		expect(handler).toBeDefined();
		expect(event.preventDefault).toHaveBeenCalled();
	});

	it('does not call preventDefault when game is not in progress', () => {
		proto.init.mockImplementationOnce(async function (this: any) {
			this.audioManager = { isMuted: false, toggleMute: vi.fn() };
			// status intentionally left as 'uninitialized'
		});

		const addSpy = vi.spyOn(window, 'addEventListener');
		render(Game);

		const handler = getBeforeUnloadHandler(addSpy);
		const event = { preventDefault: vi.fn() };
		handler?.(event);

		expect(handler).toBeDefined();
		expect(event.preventDefault).not.toHaveBeenCalled();
	});

	it('removes the listener when the component unmounts', () => {
		const addSpy = vi.spyOn(window, 'addEventListener');
		const removeSpy = vi.spyOn(window, 'removeEventListener');

		const { unmount } = render(Game);

		const registeredHandler = getBeforeUnloadHandler(addSpy);
		unmount();

		const removeCall = (removeSpy.mock.calls as [string, EventListener][]).find(
			([type]) => type === 'beforeunload'
		);
		expect(removeCall?.[1]).toBe(registeredHandler);
	});
});
