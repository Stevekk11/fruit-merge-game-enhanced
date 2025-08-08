import type { Component } from 'svelte';
interface FruitProps {
    radius: number | string;
    name: string;
    display?: 'block' | 'inline';
    scale?: number;
}
declare const Fruit: Component<FruitProps, {}, "">;
type Fruit = ReturnType<typeof Fruit>;
export default Fruit;
