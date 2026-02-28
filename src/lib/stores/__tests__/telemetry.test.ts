import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TelemetryState } from '../telemetry.svelte.js';

// Mock $env/dynamic/public and buildInfo so the module can be imported without SvelteKit
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_SHARED_CLIENT_SALT: 'test-salt' } }));
vi.mock('../../buildInfo', () => ({ APP_VERSION: '0.0.0-test', BUILD_HASH: 'testhash' }));

beforeEach(() => {
	vi.clearAllMocks();
	// Reset performance.now to a stable value
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

	describe('reset', () => {
		it('clears milestones, sessionStartTime, and sessionToken', () => {
			const state = new TelemetryState();
			state.milestones = [{ timeOffsetMs: 100, scoreIncrement: 50, fruitIndex: 1, dropCount: 5 }];
			state.sessionStartTime = 1234;
			state.sessionToken = 'some-token';

			state.reset();

			expect(state.milestones).toHaveLength(0);
			expect(state.sessionStartTime).toBeNull();
			expect(state.sessionToken).toBeNull();
		});
	});

	describe('submitGlobalScore', () => {
		it('returns { success: false } when sessionToken is null', async () => {
			const state = new TelemetryState();
			state.sessionToken = null;
			state.milestones = [{ timeOffsetMs: 100, scoreIncrement: 50, fruitIndex: 1, dropCount: 5 }];

			const result = await state.submitGlobalScore('player1', 500);

			expect(result.success).toBe(false);
		});

		it('returns { success: false } when milestones is empty', async () => {
			const state = new TelemetryState();
			state.sessionToken = 'valid-token';
			state.milestones = [];

			const result = await state.submitGlobalScore('player1', 500);

			expect(result.success).toBe(false);
		});

		it('calls fetch with payload when session data is valid', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				json: async () => ({ success: true })
			});
			vi.stubGlobal('fetch', mockFetch);

			const state = new TelemetryState();
			state.sessionToken = 'valid-token';
			state.milestones = [{ timeOffsetMs: 100, scoreIncrement: 50, fruitIndex: 1, dropCount: 5 }];

			const result = await state.submitGlobalScore('player1', 500);

			expect(mockFetch).toHaveBeenCalledTimes(1);
			const [url, opts] = mockFetch.mock.calls[0];
			expect(url).toContain('/api/leaderboard/submit');
			const body = JSON.parse(opts.body);
			expect(body.username).toBe('player1');
			expect(body.finalScore).toBe(500);
			expect(body.sessionToken).toBe('valid-token');
			expect(result.success).toBe(true);

			vi.unstubAllGlobals();
		});
	});
});
