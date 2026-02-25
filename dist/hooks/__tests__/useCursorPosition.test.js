import { describe, it, expect } from 'vitest';
import { useCursorPosition } from '../useCursorPosition.svelte';
import { tick } from 'svelte';
if (typeof globalThis.PointerEvent === 'undefined') {
    class MockPointerEvent extends Event {
        clientX;
        clientY;
        constructor(type, props = {}) {
            super(type);
            this.clientX = props?.clientX || 0;
            this.clientY = props?.clientY || 0;
        }
    }
    globalThis.PointerEvent = MockPointerEvent;
}
describe('useCursorPosition', () => {
    it('tracks cursor position based on initial bounding rect', async () => {
        const hook = useCursorPosition();
        // Mock node
        const node = document.createElement('div');
        const initialRect = {
            left: 100,
            top: 50,
            width: 200,
            height: 200,
            right: 300,
            bottom: 250,
            x: 100,
            y: 50,
            toJSON: () => { }
        };
        const actionReturn = hook.action(node, initialRect);
        expect(hook.x).toBe(0);
        expect(hook.y).toBe(0);
        // Simulate pointer move
        const pointerEvent = new PointerEvent('pointermove', {
            clientX: 150,
            clientY: 75
        });
        node.dispatchEvent(pointerEvent);
        // With Svelte 5, state updates are synchronous in tests or might require tick()
        await tick();
        expect(hook.x).toBe(50); // 150 - 100
        expect(hook.y).toBe(25); // 75 - 50
        actionReturn.destroy();
    });
    it('updates cursor position calculation when bounding rect changes', async () => {
        const hook = useCursorPosition();
        // Mock node
        const node = document.createElement('div');
        const initialRect = {
            left: 100,
            top: 50,
            width: 200,
            height: 200,
            right: 300,
            bottom: 250,
            x: 100,
            y: 50,
            toJSON: () => { }
        };
        const actionReturn = hook.action(node, initialRect);
        // Update to a new rect
        const newRect = {
            left: 200,
            top: 100,
            width: 200,
            height: 200,
            right: 400,
            bottom: 300,
            x: 200,
            y: 100,
            toJSON: () => { }
        };
        actionReturn.update(newRect);
        // Simulate pointer move with the new rect in place
        const pointerEvent = new PointerEvent('pointermove', {
            clientX: 250,
            clientY: 150
        });
        node.dispatchEvent(pointerEvent);
        await tick();
        expect(hook.x).toBe(50); // 250 - 200
        expect(hook.y).toBe(50); // 150 - 100
        actionReturn.destroy();
    });
    it('ignores pointer events if bounding rect is undefined', async () => {
        const hook = useCursorPosition();
        const node = document.createElement('div');
        // No initial rect
        const actionReturn = hook.action(node, undefined);
        // Simulate pointer move
        const pointerEvent = new PointerEvent('pointermove', {
            clientX: 150,
            clientY: 75
        });
        node.dispatchEvent(pointerEvent);
        await tick();
        // x and y should remain at their initial 0 values
        expect(hook.x).toBe(0);
        expect(hook.y).toBe(0);
        actionReturn.destroy();
    });
});
