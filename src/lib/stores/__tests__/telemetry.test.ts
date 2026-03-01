import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TelemetryState } from '../telemetry.svelte.js';

// Mock $env/dynamic/public and buildInfo so the module can be imported without SvelteKit
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_SHARED_CLIENT_SALT: 'test-salt' } }));
vi.mock('../../buildInfo', () => ({ APP_VERSION: '0.0.0-test', BUILD_HASH: 'testhash' }));

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(performance, 'now').mockReturnValue(1000);
});

describe('TelemetryState', () => {
	describe('trackMilestone', () => {
		it('records a milestone when sessionStartTime is set and points > 0', () => {
			const state = new TelemetryState();
			state.sessionStartTime = 500;
			vi.spyOn(performance, 'now').mockReturnValue(1500);

			state.trackMilestone(100, 2, 3);

			expect(state.milestones).toHaveLength(1);
			expect(state.milestones[0]).toMatchObject({
				timeOffsetMs: 1000, // 1500 - 500
				scoreIncrement: 100,
				fruitIndex: 2,
				dropCount: 3
			});
		});

		it('does not record a milestone when sessionStartTime is null', () => {
			const state = new TelemetryState();
			state.trackMilestone(100, 2, 3);
			expect(state.milestones).toHaveLength(0);
		});

		it('does not record a milestone when points === 0', () => {
			const state = new TelemetryState();
			state.sessionStartTime = 500;
			state.trackMilestone(0, 2, 3);
			expect(state.milestones).toHaveLength(0);
		});

		it('accumulates multiple milestones', () => {
			const state = new TelemetryState();
			state.sessionStartTime = 1; // 0 is falsy, use 1
			state.trackMilestone(10, 0, 1);
			state.trackMilestone(20, 1, 2);
			expect(state.milestones).toHaveLength(2);
		});
	});

	describe('setSession', () => {
		it('sets sessionStartTime based on performance.now()', () => {
			const state = new TelemetryState();
			vi.spyOn(performance, 'now').mockReturnValue(12345);

			state.setSession('some-token');

			expect(state.sessionStartTime).toBe(12345);
		});
	});

	describe('reset', () => {
		it('clears milestones and sessionStartTime', () => {
			const state = new TelemetryState();
			state.milestones = [{ timeOffsetMs: 100, scoreIncrement: 50, fruitIndex: 1, dropCount: 5 }];
			state.sessionStartTime = 1234;

			state.reset();

			expect(state.milestones).toHaveLength(0);
			expect(state.sessionStartTime).toBeNull();
		});
	});

	describe('buildSubmissionPayload', () => {
		it('returns null when milestones is empty', async () => {
			const state = new TelemetryState();
			const result = await state.buildSubmissionPayload('player1', 500, 'token');
			expect(result).toBeNull();
		});

		it('builds a payload with correct fields and hash', async () => {
			const state = new TelemetryState();
			state.milestones = [{ timeOffsetMs: 100, scoreIncrement: 50, fruitIndex: 1, dropCount: 5 }];

			const result = await state.buildSubmissionPayload('player1', 500, 'valid-token');

			expect(result).not.toBeNull();
			expect(result?.username).toBe('player1');
			expect(result?.finalScore).toBe(500);
			expect(result?.sessionToken).toBe('valid-token');
			expect(result?.clientVersion).toBe('0.0.0-test');
			expect(result?.buildHash).toBe('testhash');
			expect(typeof result?.validationHash).toBe('string');
			expect((result?.validationHash as string).length).toBe(64); // SHA-256 hex
		});
	});
});
