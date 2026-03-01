import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: 'index.html',
			strict: false
		}),
		paths: {
			base: process.env.BASE_PATH ?? ''
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
