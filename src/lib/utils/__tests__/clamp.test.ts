import { describe, it, expect } from 'vitest';
import { clamp } from '../clamp';

describe('clamp', () => {
	it('returns the value if it is within range', () => {
		expect(clamp(5, 1, 10)).toBe(5);
	});

	it('returns the minimum if the value is below range', () => {
		expect(clamp(0, 1, 10)).toBe(1);
		expect(clamp(-5, -2, 2)).toBe(-2);
	});

	it('returns the maximum if the value is above range', () => {
		expect(clamp(15, 1, 10)).toBe(10);
		expect(clamp(5, -2, 2)).toBe(2);
	});
});
