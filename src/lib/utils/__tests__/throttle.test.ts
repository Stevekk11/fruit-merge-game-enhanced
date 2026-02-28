import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { throttle } from '../throttle';

describe('throttle', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	it('executes immediately on first call', () => {
		const fn = vi.fn();
		const throttled = throttle(fn, 100);
		throttled();
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('throttles subsequent calls within the wait period', () => {
		const fn = vi.fn();
		const throttled = throttle(fn, 100);

		throttled();
		throttled(); // Should be ignored
		throttled(); // Should be ignored

		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('executes again after the wait period', () => {
		const fn = vi.fn();
		const throttled = throttle(fn, 100);

		throttled(); // Expected execution

		vi.advanceTimersByTime(50);
		throttled(); // Ignored

		vi.advanceTimersByTime(51); // 101ms elapsed total
		throttled(); // Expected execution

		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('returns the last result if throttled', () => {
		const fn = vi.fn().mockReturnValueOnce('first').mockReturnValueOnce('second');
		const throttled = throttle(fn, 100);

		expect(throttled()).toBe('first');
		expect(throttled()).toBe('first'); // Throttled, returns last result

		vi.advanceTimersByTime(101);
		expect(throttled()).toBe('second');
	});
});
