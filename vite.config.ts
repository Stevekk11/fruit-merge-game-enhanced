import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import svg from '@poppanator/sveltekit-svg';
import { execSync } from 'child_process';
import pkg from './package.json';

const buildHash = (() => {
	try {
		return execSync('git rev-parse --short HEAD').toString().trim();
	} catch {
		return 'dev';
	}
})();

export default defineConfig({
	plugins: [sveltekit(), svg()],
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
		__BUILD_HASH__: JSON.stringify(buildHash)
	},
	server: {
		port: 4032 // PLU code of 수박
	}
});
