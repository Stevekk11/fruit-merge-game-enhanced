<script lang="ts">
import NumberFlow from '@number-flow/svelte';

interface Props {
	number: number;
}

const { number }: Props = $props();
</script>

<NumberFlow value={number} willChange={true} />
