/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';

// Hoist: stub WASM-heavy physics engine and screenshot library before Game.svelte loads
vi.mock('@dimforge/rapier2d-compat', () => ({
	init: vi.fn().mockResolvedValue(undefined),
	Vector2: vi.fn((x: number, y: number) => ({ x, y })),
	World: vi.fn(() => ({
		integrationParameters: { dt: 1 / 60, numSolverIterations: 8 },
		step: vi.fn(),
		removeRigidBody: vi.fn()
	})),
	EventQueue: vi.fn(() => ({ drainCollisionEvents: vi.fn() })),
	RigidBodyDesc: {
		dynamic: vi.fn(() => ({
			setTranslation: vi.fn().mockReturnThis(),
			setLinearDamping: vi.fn().mockReturnThis()
		}))
	},
	ColliderDesc: {
		ball: vi.fn(() => ({
			setRestitution: vi.fn().mockReturnThis(),
			setFriction: vi.fn().mockReturnThis(),
			setActiveEvents: vi.fn().mockReturnThis()
		}))
	},
	ActiveEvents: { COLLISION_EVENTS: 1 }
}));

vi.mock('modern-screenshot', () => ({
	domToPng: vi.fn().mockResolvedValue('data:image/png;base64,stub')
}));

import { render, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect, beforeEach } from 'vitest';

import Game from '../Game.svelte';
import * as gameStateModule from '../../stores/game.svelte.js';

// --- Mock GameState ---------------------------------------------------------
const instances: any[] = [];
export const setStatusSpy = vi.fn();
export const dropFruitSpy = vi.fn();
export const restartGameSpy = vi.fn();

function createMockGameState() {
	const state = $state({
		score: 0,
		gameOver: false,
		status: 'uninitialized',
		currentFruitIndex: 0,
		nextFruitIndex: 1,
		fruitsState: [] as any[],
		mergeEffects: [] as any[],
		dropCount: 0,
		audioManager: { isMuted: false, toggleMute: vi.fn() },
		telemetry: { fetchSession: vi.fn(), submitGlobalScore: vi.fn(), reset: vi.fn() },
		// Methods
		dropFruit: (index: number, x: number, y: number) => {
			state.fruitsState.push({ id: Math.random(), x, y, rotation: 0, fruitIndex: index });
			state.dropCount++;
			dropFruitSpy(index, x, y);
		},
		restartGame: () => {
			state.gameOver = false;
			state.fruitsState = [];
			state.dropCount = 0;
			state.status = 'playing';
			restartGameSpy();
		},
		setStatus: (status: string) => {
			state.status = status;
			setStatusSpy(status);
		},
		init: vi.fn(async () => {}),
		destroy: vi.fn()
	});
	instances.push(state);
	return state;
}

vi.mock('../../stores/game.svelte.js', () => ({ GameState: vi.fn() }));

// Replace the mocked constructor with our implementation
(gameStateModule as any).GameState.mockImplementation(createMockGameState);

// Mock FRUITS constant
const MOCK_FRUITS = [
	{ id: 0, name: 'FruitA', radius: 0.1, points: 10, image: 'images/fruitA.webp', color: 'red' },
	{ id: 1, name: 'FruitB', radius: 0.12, points: 20, image: 'images/fruitB.webp', color: 'yellow' },
	{ id: 2, name: 'FruitC', radius: 0.15, points: 30, image: 'images/fruitC.webp', color: 'orange' }
];

vi.mock('../../constants', async () => {
	const actual = await vi.importActual('../../constants');
	const fruitsForMock = [
		{ id: 0, name: 'FruitA', radius: 0.1, points: 10, image: 'images/fruitA.webp', color: 'red' },
		{
			id: 1,
			name: 'FruitB',
			radius: 0.12,
			points: 20,
			image: 'images/fruitB.webp',
			color: 'yellow'
		},
		{
			id: 2,
			name: 'FruitC',
			radius: 0.15,
			points: 30,
			image: 'images/fruitC.webp',
			color: 'orange'
		}
	];
	return {
		...(actual as any),
		FRUITS: fruitsForMock
	};
});

// ---------------------------------------------------------------------------

beforeEach(() => {
	instances.length = 0;
	setStatusSpy.mockClear();
	dropFruitSpy.mockClear();
	restartGameSpy.mockClear();
});

describe('Game component', () => {
	it('initializes with introduction modal open', () => {
		const { getAllByText } = render(Game);
		expect(getAllByText('Subak Game').length).toBeGreaterThan(0);
		expect(instances.length).toBe(1);
		expect(instances[0].score).toBe(0);
	});

	it('moves drop line and preview fruit with pointer', async () => {
		const { container, getAllByRole } = render(Game);
		// close introduction modal → sets status to 'playing'
		await fireEvent.click(getAllByRole('button', { name: /start game/i })[0]);
		await tick();

		const area = container.querySelector('.gameplay-area') as HTMLElement;
		Object.defineProperty(area, 'getBoundingClientRect', {
			value: () => ({ left: 0, top: 0, width: 600, height: 900, right: 600, bottom: 900 })
		});

		await fireEvent.pointerMove(area, { clientX: 150, clientY: 100 });

		const dropLine = container.querySelector('.drop-line') as HTMLElement;
		const preview = container.querySelector('.preview-fruit') as HTMLElement;
		expect(dropLine.style.translate).toContain('148px');
		expect(preview.style.translate).toContain('149px');
	});

	it('drops a fruit on pointer-up when playing', async () => {
		const { container, getAllByRole } = render(Game);
		await fireEvent.click(getAllByRole('button', { name: /start game/i })[0]);
		await tick();

		// Force status to 'playing' so dropCurrentFruit runs
		instances[0].status = 'playing';
		await tick();

		const area = container.querySelector('.gameplay-area') as HTMLElement;
		Object.defineProperty(area, 'getBoundingClientRect', {
			value: () => ({ left: 0, top: 0, width: 600, height: 900, right: 600, bottom: 900 })
		});

		await fireEvent.pointerUp(area, { button: 0 });
		await tick();

		expect(dropFruitSpy).toHaveBeenCalled();
	});

	it('opens introduction modal via About button and pauses game', async () => {
		const { getAllByRole } = render(Game);

		// Close intro first
		await fireEvent.click(getAllByRole('button', { name: /start game/i })[0]);
		await tick();

		// Click About → pauses via setStatus('paused')
		await fireEvent.click(getAllByRole('button', { name: /about/i })[0]);
		await tick();

		expect(setStatusSpy).toHaveBeenCalledWith('paused');

		// Modal reappears with "Resume Game" text (derived from 'paused' status)
		expect(getAllByRole('button', { name: /resume game/i }).length).toBeGreaterThan(0);
	});

	it('maintains correct fruit images after state changes (merges/removals)', async () => {
		const { container, getAllByRole } = render(Game);

		await fireEvent.click(getAllByRole('button', { name: /start game/i })[0]);
		await tick();

		const mockGameState = instances[0];
		expect(mockGameState).toBeTruthy();

		mockGameState.fruitsState.length = 0;
		mockGameState.fruitsState.push(
			{ id: 1, x: 100, y: 100, rotation: 0, fruitIndex: 0 }, // FruitA
			{ id: 2, x: 200, y: 100, rotation: 0, fruitIndex: 1 }, // FruitB
			{ id: 3, x: 300, y: 100, rotation: 0, fruitIndex: 0 } // FruitA
		);
		mockGameState.setStatus('playing');
		await tick();

		let fruitNodes = container.querySelectorAll(
			'.gameplay-area > .game-entity .fruit'
		) as NodeListOf<HTMLElement>;
		expect(fruitNodes.length).toBe(3);
		expect(fruitNodes[0].getAttribute('data-name')).toBe(MOCK_FRUITS[0].name);
		expect(fruitNodes[1].getAttribute('data-name')).toBe(MOCK_FRUITS[1].name);
		expect(fruitNodes[2].getAttribute('data-name')).toBe(MOCK_FRUITS[0].name);

		// Remove FruitA's, keep FruitB
		const fruitB = mockGameState.fruitsState[1];
		mockGameState.fruitsState.length = 0;
		mockGameState.fruitsState.push(fruitB);
		await tick();

		fruitNodes = container.querySelectorAll(
			'.gameplay-area > .game-entity .fruit'
		) as NodeListOf<HTMLElement>;
		expect(fruitNodes.length).toBe(1);
		expect(fruitNodes[0].getAttribute('data-name')).toBe(MOCK_FRUITS[1].name);

		// Add FruitC
		mockGameState.fruitsState.push({ id: 4, x: 400, y: 100, rotation: 0, fruitIndex: 2 });
		await tick();

		fruitNodes = container.querySelectorAll(
			'.gameplay-area > .game-entity .fruit'
		) as NodeListOf<HTMLElement>;
		expect(fruitNodes.length).toBe(2);
		expect(fruitNodes[0].getAttribute('data-name')).toBe(MOCK_FRUITS[1].name);
		expect(fruitNodes[1].getAttribute('data-name')).toBe(MOCK_FRUITS[2].name);
	});
});
