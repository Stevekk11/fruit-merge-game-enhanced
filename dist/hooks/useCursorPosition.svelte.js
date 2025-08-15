/**
 * A Svelte 5 action that tracks the cursor's position relative to an element.
 *
 * This action composes `useBoundingRect` to efficiently track the element's
 * position and size, updating the cursor's relative coordinates reactively.
 *
 * @returns An object with:
 * - `x`: A readonly, reactive `$state` variable for the relative horizontal coordinate.
 * - `y`: A readonly, reactive `$state` variable for the relative vertical coordinate.
 * - `action`: A Svelte action to apply to the target element using `use:`.
 *
 * @example
 * ```svelte
 * <script>
 * import { useCursorPosition } from './useCursorPosition';
 *
 * const { x, y, action } = useCursorPosition();
 * </script>
 *
 * <div use:action>
 * <p>Relative cursor position: {$x}, {$y}</p>
 * </div>
 * ```
 */
export function useCursorPosition() {
    // Internal reactive state for coordinates.
    let x = $state(0);
    let y = $state(0);
    // 2. Define the main action that the user will apply to their element.
    const action = (node, rect) => {
        // Handler to update cursor position, now simplified.
        // It relies on the `rect` signal from our composed hook.
        const handlePointerMove = (event) => {
            // The `rect` signal will be undefined until `boundingRectAction` runs.
            if (!rect)
                return;
            // Calculate position relative to the element's top-left corner.
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        };
        // Use modern Pointer Events for unified mouse, touch, and pen input.
        node.addEventListener('pointermove', handlePointerMove);
        // The action's destroy method ensures all listeners are cleaned up.
        return {
            destroy() {
                node.removeEventListener('pointermove', handlePointerMove);
            }
        };
    };
    // Return the readonly state and the action.
    return {
        get x() {
            return x;
        },
        get y() {
            return y;
        },
        action
    };
}
