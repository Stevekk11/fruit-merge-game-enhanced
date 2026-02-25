/// <reference types="vite/client" />

declare module '*.svg?component' {
	import type { SvelteComponentTyped } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';

	class SvgComponent extends SvelteComponentTyped<SVGAttributes<SVGSVGElement>> {}

	export default SvgComponent;
}
