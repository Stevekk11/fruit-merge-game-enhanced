import globals from 'globals';
import js from '@eslint/js';
import tsEslint from 'typescript-eslint';
import svelteEslint from 'eslint-plugin-svelte';
import prettierEslint from 'eslint-config-prettier';

import svelteConfig from './svelte.config.js';

export default tsEslint.config(
	js.configs.recommended,
	...tsEslint.configs.recommended,
	...svelteEslint.configs.prettier,
	// Apply Prettier's formatting rules
	prettierEslint,
	{
		ignores: ['dist/**', 'dist/', 'dist/**/*', 'docs/**', '.svelte-kit/**']
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		// See more details at: https://typescript-eslint.io/packages/parser/
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'], // Add support for additional file extensions, such as .svelte
				parser: tsEslint.parser,
				svelteConfig
			}
		}
	},
	{
		rules: {
			// Override or add rule settings here, such as:
			// 'svelte/rule-name': 'error'
		}
	}
);
