/**
 * A Svelte 5 composable for tracking an element's bounding rectangle.
 *
 * It uses a ResizeObserver for high-performance size tracking and also updates
 * on window scroll and resize events to keep viewport-relative properties
 * (`top`, `left`, `x`, `y`) accurate.
 *
 * @returns An object with:
 * - `rect`: A readonly, reactive `$state` variable holding the element's DOMRect.
 * - `action`: A Svelte action to apply to the target element using `use:`.
 *
 * @example
 * ```svelte
 * <script>
 * import { useBoundingRect } from './useBoundingRect';
 *
 * const { rect, action } = useBoundingRect();
 * </script>
 *
 * <div use:action>
 * {#if $rect}
 * <p>Dimensions: {$rect.width}px x {$rect.height}px</p>
 * {/if}
 * </div>
 * ```
 */
export declare function useBoundingRect(): {
    readonly rect: DOMRectReadOnly;
    action: (node: HTMLElement) => {
        destroy(): void;
    };
};
