import { expect, test, vi, describe, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import UseBoundingRectTest from './UseBoundingRectTest.svelte';
import { tick } from 'svelte';

describe('useBoundingRect', () => {
	let originalResizeObserver: typeof ResizeObserver;
	let observeMock = vi.fn();
	let disconnectMock = vi.fn();

	beforeEach(() => {
		originalResizeObserver = globalThis.ResizeObserver;

		globalThis.ResizeObserver = class {
			observe = observeMock;
			unobserve = vi.fn();
			disconnect = disconnectMock;
		} as unknown as typeof ResizeObserver;
	});

	afterEach(() => {
		cleanup();
		globalThis.ResizeObserver = originalResizeObserver;
		vi.restoreAllMocks();
	});

	test('initializes and triggers update on mount', async () => {
		vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
			x: 10,
			y: 10,
			width: 100,
			height: 100,
			top: 10,
			right: 110,
			bottom: 110,
			left: 10,
			toJSON: () => {}
		});

		render(UseBoundingRectTest);
		await tick();

		expect(observeMock).toHaveBeenCalled();
		expect(screen.getByTestId('rect-width').textContent).toBe('100');
	});

	test('updates on scroll and resize events', async () => {
		const spy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
			x: 20,
			y: 20,
			width: 200,
			height: 200,
			top: 20,
			right: 220,
			bottom: 220,
			left: 20,
			toJSON: () => {}
		});

		render(UseBoundingRectTest);
		await tick();
		expect(screen.getByTestId('rect-width').textContent).toBe('200');

		spy.mockReturnValue({
			x: 30,
			y: 30,
			width: 300,
			height: 300,
			top: 30,
			right: 330,
			bottom: 330,
			left: 30,
			toJSON: () => {}
		});

		window.dispatchEvent(new Event('scroll'));
		await tick();
		expect(screen.getByTestId('rect-width').textContent).toBe('300');
	});
});
