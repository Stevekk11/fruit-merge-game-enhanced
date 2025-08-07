<script lang="ts">
	interface FruitProps {
		name: string;
	}

	const { name }: FruitProps = $props();

	const FruitImage = (await import(`../svg/${name}.svg?component`)).default;
</script>

<FruitImage style="display: block;" />
