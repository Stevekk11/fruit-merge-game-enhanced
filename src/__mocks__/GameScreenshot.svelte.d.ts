interface $$__sveltets_2_IsomorphicComponent<
	Props extends Record<string, unknown> = Record<string, unknown>,
	Events extends Record<string, unknown> = Record<string, unknown>,
	Slots extends Record<string, unknown> = Record<string, unknown>,
	Exports = Record<string, never>,
	Bindings = string
> {
	new (
		options: import('svelte').ComponentConstructorOptions<Props>
	): import('svelte').SvelteComponent<Props, Events, Slots> & {
		$$bindings?: Bindings;
	} & Exports;
	(
		internal: unknown,
		props: {
			$$events?: Events;
			$$slots?: Slots;
		}
	): Exports & {
		$set?: Record<string, unknown>;
		$on?: Record<string, unknown>;
	};
	z_$$bindings?: Bindings;
}
declare const GameScreenshot: $$__sveltets_2_IsomorphicComponent<
	Record<string, never>,
	{
		[evt: string]: CustomEvent<unknown>;
	},
	Record<string, never>,
	Record<string, never>,
	string
>;
type GameScreenshot = InstanceType<typeof GameScreenshot>;
export default GameScreenshot;
