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
export function useBoundingRect() {
    let rect = $state(undefined);
    // Svelte action
    const action = (node) => {
        let autoUpdateTimeoutId;
        // This function updates the reactive `rect` state.
        const update = () => {
            rect = node.getBoundingClientRect();
            // (Sanity) auto update just in case something we can't
            // watch changes the dimensions
            clearTimeout(autoUpdateTimeoutId);
            autoUpdateTimeoutId = setTimeout(update, 1_000);
        };
        // Set the initial value as soon as the element is mounted.
        update();
        // Create a ResizeObserver to efficiently watch for changes to the element's size.
        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(node);
        // Also update on window scroll and resize to catch changes in the element's
        // position relative to the viewport. `{ passive: true }` improves scroll performance.
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update, { passive: true });
        return {
            destroy() {
                resizeObserver.disconnect();
                window.removeEventListener('scroll', update);
                window.removeEventListener('resize', update);
            }
        };
    };
    return {
        get rect() {
            return rect;
        },
        action
    };
}
