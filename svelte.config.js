import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: 'index.html',
			strict: false
		})
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
