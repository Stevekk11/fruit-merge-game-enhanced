/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FRUITS } from '../../constants';
import { GameState } from '../game.svelte.js';

// Stub physics related methods before constructing GameState
const proto: any = GameState.prototype;
vi.spyOn(proto, 'initPhysics').mockImplementation(async function (this: any) {
	this.physicsWorld = {
		integrationParameters: { dt: 1 / 60 },
		removeRigidBody: vi.fn(),
		step: vi.fn()
	};
	this.eventQueue = { drainCollisionEvents: vi.fn() };
});
vi.spyOn(proto, 'update').mockImplementation(function (this: any) {
	if (this.status !== 'playing') {
		if (this.animationFrameId) {
			clearTimeout(this.animationFrameId);
			this.animationFrameId = null;
		}
		return;
	}
	this.stepPhysics();
	this.throttledCheckGameOver?.();
});
vi.spyOn(proto, 'addFruit').mockImplementation(function (
	this: any,
	fruitIndex: number,
	x: number,
	y: number
) {
	const fruit = {
		fruitIndex,
		radius: FRUITS[fruitIndex].radius,
		points: FRUITS[fruitIndex].points,
		body: {
			handle: (this._handle = (this._handle ?? 0) + 1),
			isValid: () => true,
			translation: () => ({ x, y }),
			rotation: () => 0,
			linvel: () => ({ x: 0, y: 0 })
		},
		collider: { handle: this._handle || 0 },
		destroy: vi.fn(),
		isOutOfBounds: vi.fn().mockReturnValue(false),
		physicsWorld: this.physicsWorld
	};
	this.fruits.push(fruit);
	this.colliderMap.set(fruit.body.handle, fruit);
	return fruit;
});

beforeEach(() => {
	vi.clearAllMocks();
});

describe('GameState Methods', () => {
	it('merges two fruits of the same type', () => {
		const state = new GameState({});
		state.physicsWorld = {} as any; // mock physicsWorld
		// add two fruits of type 0
		const a = state.addFruit(0, 0.2, 0.2);
		const b = state.addFruit(0, 0.25, 0.2);
		const initialCount = state.fruits.length;
		state.mergeFruits(a!, b!);
		expect(state.fruits.length).toBe(initialCount - 1);
		expect(state.fruits[0].fruitIndex).toBe(1);
		expect(state.score).toBe(FRUITS[1].points);
	});

	it('drops a fruit correctly', () => {
		const state = new GameState({});
		state.physicsWorld = {} as any;
		state.setStatus('playing');
		state.setNextFruitIndex(2);

		state.dropFruit(1, 100, 100);

		expect(state.fruits.length).toBe(1);
		expect(state.fruits[0].fruitIndex).toBe(1);
		expect(state.dropCount).toBe(1);
		expect(state.currentFruitIndex).toBe(2);
	});

	it('handles checkGameOver', () => {
		const state = new GameState({});
		state.physicsWorld = {} as any;
		state.setStatus('playing');

		const fruit: any = state.addFruit(0, 0, 0);
		fruit.isOutOfBounds.mockReturnValue(true);

		state.checkGameOver();
		expect(state.status).toBe('gameover');
	});

	it('resets game state correctly', () => {
		const state = new GameState({});
		state.physicsWorld = {} as any;
		state.fruits = [{ destroy: vi.fn() }] as any;
		state.score = 100;
		state.dropCount = 5;
		state.telemetry = { reset: vi.fn() } as any;

		state.resetGame();

		expect(state.fruits.length).toBe(0);
		expect(state.score).toBe(0);
		expect(state.dropCount).toBe(0);
		expect(state.status).toBe('uninitialized');
	});

	it('restarts game correctly', () => {
		const state = new GameState({});
		state.resetGame = vi.fn();
		state.telemetry = { fetchSession: vi.fn() } as any;

		state.restartGame();

		expect(state.resetGame).toHaveBeenCalled();
		expect(state.telemetry.fetchSession).toHaveBeenCalled();
		expect(state.status).toBe('playing');
	});

	it('setStatus handles animation frame cancellation', () => {
		const state = new GameState({});
		state.animationFrameId = 123 as any;
		state.setStatus('paused');
		expect(state.animationFrameId).toBeNull();
	});
});
