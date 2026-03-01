export const GAME_WIDTH = 0.6; // meters
export const GAME_HEIGHT = 0.9; // meters
export const GAME_WIDTH_PX = 600;
export const WALL_THICKNESS = GAME_WIDTH / 20;
export const GAME_OVER_HEIGHT = GAME_HEIGHT / 6; // Y position above which game ends

const FRUIT_NAMES: string[] = [
	'blueberry',
	'grape',
	'lemon',
	'orange',
	'apple',
	'dragonfruit',
	'pear',
	'peach',
	'pineapple',
	'honeydew',
	'watermelon'
];

// SUIKA FRUIT SIZES (original)
// export const FRUIT_SIZES: number[] = [
// 	6.76, 8.86, 13.66, 14.41, 19.07, 25.23, 28.38, 35.29, 39.34, 48.57, 57.81
// ];

// Manual, based on suika
const FRUIT_SIZES: number[] = [
	6.76, 8.86, 11.55, 14.41, 19.07, 23.54, 28.38, 34.93, 39.34, 48.57, 57.81
];

interface FruitData {
	name: string;
	color: string;
	size: number;
	radius: number;
	points: number;
}

export const FRUITS: FruitData[] = [];

for (let i = 0; i < FRUIT_NAMES.length; i++) {
	const currentSize = FRUIT_SIZES[i] / 2;
	const currentRadius = GAME_WIDTH * (currentSize / 100);
	const fruitName = FRUIT_NAMES[i];
	FRUITS.push({
		name: fruitName,
		color: '#000000',
		size: currentSize,
		radius: currentRadius,
		points: (i + 1) * 2
	});
}

export const DEFAULT_IMAGES_PATH = '/images';
export const DEFAULT_SOUNDS_PATH = '/sounds';
