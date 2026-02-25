<script lang="ts">
	import TKIcon from '../icons/tk.svelte';
	import { APP_VERSION } from '../constants';

	const VERSION = APP_VERSION;
</script>

<div class="footer">
	<a class="credit" href="https://kempf.dev/#subak" target="_blank">
		Crafted by <span class="tk-logo"><TKIcon /></span></a>
	<span class="version">v <var>{VERSION}</var></span>
</div>

<style>
	.footer {
		display: flex;
		justify-content: space-between;
		color: var(--color-very-light-text);

		a {
			color: inherit;

			&:hover {
				color: var(--color-light-text);
			}
		}
	}

	.tk-logo {
		font-size: 0.8em;
		display: inline-block;
	}
</style>
