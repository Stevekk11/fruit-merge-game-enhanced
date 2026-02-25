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
export declare function useCursorPosition(): {
    readonly x: number;
    readonly y: number;
    action: (node: HTMLElement, initialRect?: DOMRectReadOnly) => {
        update(newRect?: DOMRectReadOnly): void;
        destroy(): void;
    };
};
