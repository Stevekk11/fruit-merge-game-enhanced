<script lang="ts">
import { useBoundingRect } from '../useBoundingRect.svelte';
const bounds = useBoundingRect();
</script>

<div use:bounds.action data-testid="target"></div>
<div data-testid="rect-width">{bounds.rect?.width ?? "undefined"}</div>
