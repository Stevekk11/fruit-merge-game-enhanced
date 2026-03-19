import type {EventQueue, World} from '@dimforge/rapier2d-compat';

import {DEFAULT_IMAGES_PATH, DEFAULT_SOUNDS_PATH, FRUITS, GAME_HEIGHT, GAME_WIDTH, WALL_THICKNESS} from '../constants'; // Ensure constants are correctly typed in their file
import {AudioManager} from '../game/AudioManager.svelte';
import {Boundary} from '../game/Boundary';
import {Fruit} from '../game/Fruit';
import {Bomb} from '../game/Bomb';
import {throttle} from '../utils/throttle';
import {LeaderboardClient} from '../api/leaderboard-client.svelte';
import {TelemetryState} from './telemetry.svelte';

// --- Constants for Volume Mapping ---
const MIN_VELOCITY_FOR_SOUND = 0.2; // Ignore very gentle taps
const MAX_VELOCITY_FOR_MAX_VOL = 0.8; // Velocity at which sound is loudest
const MIN_COLLISION_VOLUME = 0.3; // Minimum volume for the quietest sound
const MAX_COLLISION_VOLUME = 1.0; // Maximum volume for the loudest sound
// --- Pitch variation settings ---
const PITCH_VARIATION_MIN = 0.9;
const PITCH_VARIATION_MAX = 1.1;
// Drop pitch rates: C major scale ~1.5 octaves (E4→B2), smallest fruit = highest pitch.
// Notes: E4, D4, C4, B3, A3, G3, F3, E3, D3, C3, B2. Each rate = 2^(semitones/12).
const DROP_PITCH_RATES = [1.2599, 1.1225, 1.0, 0.9439, 0.8409, 0.7492, 0.6674, 0.6300, 0.5612, 0.5, 0.4729];

// Helper function (as defined above)
function mapRange(
	value: number,
	inMin: number,
	inMax: number,
	outMin: number,
	outMax: number
): number {
	const clampedValue = Math.max(inMin, Math.min(value, inMax));
	return ((clampedValue - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// --- Interfaces remain the same ---
interface MergeEffectData {
	id: number;
	x: number;
	y: number;
	radius: number;
	startTime: number;
	duration: number;
}

interface ScoreTextData {
	id: number;
	x: number;
	y: number;
	score: number;
	comboCount: number;
	startTime: number;
	duration: number;
}
interface FruitState {
	id: number; // Add this line
	x: number;
	y: number;
	rotation: number;
	fruitIndex: number;
}
interface GameStateProps {
	imagesPath?: string;
	soundsPath?: string;
}
type GameStatus = 'uninitialized' | 'playing' | 'paused' | 'gameover';

export class GameState {
	__rapier: typeof import('@dimforge/rapier2d-compat') | undefined = undefined;

	audioManager: AudioManager | null = $state(null);
	score: number = $state(0);
	status: GameStatus = $state('uninitialized');
	currentFruitIndex: number = $state(0);
	nextFruitIndex: number = $state(0);
	fruits: Fruit[] = [];
	fruitsState: FruitState[] = $state([]);
	dropCount: number = $state(0);
	mergeEffects: MergeEffectData[] = $state([]);
	scoreTexts: ScoreTextData[] = $state([]);
	bombs: Bomb[] = [];
	bombsState: Array<{ id: number; x: number; y: number; radius: number }> = $state([]);

	// Abilities
	shakesRemaining: number = $state(3);
	isShaking: boolean = $state(false);
	bombsRemaining: number = $state(2);
	popAllRemaining: number = $state(2);
	selectedFruitTypeIndex: number | null = $state(null);

	// Telemetry & API
	telemetry: TelemetryState = new TelemetryState();
	leaderboard: LeaderboardClient = new LeaderboardClient();

	gameOverFruitId: number | null = $state(null);

	mergeEffectIdCounter: number = 0;
	scoreTextIdCounter: number = 0;
	lastMergeTime: number = 0;
	currentComboCount: number = 0;

	physicsAccumulator: number = 0;
	lastTime: number | null = null;
	animationFrameId: number | null = null;

	physicsWorld: World | null = null;
	eventQueue: EventQueue | null = null;
	colliderMap: Map<number, Fruit | Bomb | Boundary> = new Map();

	lastBumpSoundTime: DOMHighResTimeStamp = 0;

	// Configuration
	imagesPath: string = DEFAULT_IMAGES_PATH;
	soundsPath: string = DEFAULT_SOUNDS_PATH;

	throttledCheckGameOver?: () => void;

	constructor({ imagesPath, soundsPath }: GameStateProps) {
		if (imagesPath) this.imagesPath = imagesPath;
		if (soundsPath) this.soundsPath = soundsPath;

		this.throttledCheckGameOver = throttle(this.checkGameOver, 500);
	}

	async init() {
		const { soundsPath } = this;
		this.audioManager = new AudioManager({ soundsPath });
		await this.initPhysics();
		this.resetGame();
		this.startNewSession();
	}

	update() {
		// Ensure loop only runs if status is 'playing'
		if (this.status !== 'playing') {
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId);
				this.animationFrameId = null;
			}
			return;
		}

		this.stepPhysics(); // Run physics step
		this.throttledCheckGameOver?.(); // We done here?

		// Only request next frame if still playing
		if (this.status === 'playing') {
			this.animationFrameId = requestAnimationFrame(() => this.update());
		} else {
			// If status changed mid-update (e.g. gameover), ensure cleanup
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId);
				this.animationFrameId = null;
			}
		}
	}

	async initPhysics(): Promise<void> {
		try {
			this.__rapier = await import('@dimforge/rapier2d-compat');
			await this.__rapier.init();

			// Why is this so far off of reality.
			const gravity = new this.__rapier.Vector2(0.0, 9.86 * 0.15);
			this.physicsWorld = new this.__rapier.World(gravity);
			this.physicsWorld.integrationParameters.numSolverIterations = 8;
			this.eventQueue = new this.__rapier.EventQueue(true); // Create event queue (true enables contact events)
			this.colliderMap.clear(); // Ensure map is clear on init
			this.createBounds();
		} catch (error) {
			console.error('Failed to initialize Rapier or create physics world:', error);
			this.setStatus('gameover');
		}
	}

	stepPhysics(): void {
		if (!this.physicsWorld || !this.eventQueue) {
			// Don't step if world or event queue doesn't exist
			return;
		}

		const currentTime = performance.now();
		const physicsStepMs = this.physicsWorld.integrationParameters.dt * 1000;

		this.physicsAccumulator += currentTime - (this.lastTime || 0);
		while (this.physicsAccumulator >= physicsStepMs) {
			this.physicsAccumulator -= physicsStepMs;
			this.physicsWorld.step(this.eventQueue);
			this.checkCollisions();
		}

		this.lastTime = currentTime;

		// --- Step 3: Update Rendering State and Effects (mostly unchanged) ---
		const updatedFruitStates: FruitState[] = this.fruits
			.map((fruit) => {
				if (!fruit.body.isValid()) return null;
				return {
					id: fruit.id, // Add this line
					x: fruit.body.translation().x,
					y: fruit.body.translation().y,
					rotation: fruit.body.rotation(),
					fruitIndex: fruit.fruitIndex
				};
			})
			.filter((state): state is FruitState => state !== null);
		this.setFruitsState(updatedFruitStates);

		const newMergeEffects = this.mergeEffects
			.map((effect: MergeEffectData) => {
				const progress = (currentTime - effect.startTime) / effect.duration;

				if (progress >= 1) return null;
				return effect;
			})
			.filter((effect): effect is MergeEffectData => effect !== null);
		this.setMergeEffects(newMergeEffects);

		const newScoreTexts = this.scoreTexts
			.map((text: ScoreTextData) => {
				const progress = (currentTime - text.startTime) / text.duration;

				if (progress >= 1) return null;
				return text;
			})
			.filter((text): text is ScoreTextData => text !== null);
		this.setScoreTexts(newScoreTexts);

		// Update bomb states
		this.updateBombStates();
	}

	updateBombStates(): void {
		// Update bomb rendering state and remove bombs that hit bottom
		const activeBombs = this.bombs.filter((bomb) => {
			if (bomb.isAtBottom()) {
				this.colliderMap.delete(bomb.collider.handle);
				bomb.destroy();
				return false;
			}
			return true;
		});
		this.bombs = activeBombs;

		const updatedBombStates = this.bombs
			.map((bomb) => {
				if (!bomb.body.isValid()) return null;
				return {
					id: bomb.id,
					x: bomb.body.translation().x,
					y: bomb.body.translation().y,
					radius: bomb.radius
				};
			})
			.filter((state): state is typeof updatedBombStates[0] => state !== null);
		this.setBombsState(updatedBombStates);
	}

	checkCollisions() {
		if (!this.eventQueue) {
			return;
		}

		const currentTime = performance.now();
		const mergePairs: { fruitA: Fruit; fruitB: Fruit }[] = [];
		const mergedHandlesThisStep = new Set<number>(); // Track handles involved in a merge *this step*

		this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
			// Only process contacts that *started* in this step
			if (!started) {
				return;
			}

			// Look up our data associated with the collider handles
			const collisionItemA = this.colliderMap.get(handle1);
			const collisionItemB = this.colliderMap.get(handle2);

			if (collisionItemA?.body && collisionItemB?.body && this.audioManager) {
				// Apply random pitch variation
				const rate =
					PITCH_VARIATION_MIN + Math.random() * (PITCH_VARIATION_MAX - PITCH_VARIATION_MIN);

				// if it's two fruits they will always fire pop sound effect
				if (
					collisionItemA instanceof Fruit &&
					collisionItemB instanceof Fruit &&
					collisionItemA.fruitIndex === collisionItemB.fruitIndex
				) {
					const popRate = DROP_PITCH_RATES[collisionItemA.fruitIndex] ?? 1.0;
					this.audioManager.playSound('pop', { volume: 1, rate: popRate });
					// bump sounds have complex logic
				} else {
					// Get velocities (use {x:0, y:0} for static bodies or null bodies)
					const vel1 = collisionItemA.body.linvel() ?? { x: 0, y: 0 };
					const vel2 = collisionItemB.body.linvel() ?? { x: 0, y: 0 };

					// Calculate relative velocity magnitude
					const relVelX = vel1.x - vel2.x;
					const relVelY = vel1.y - vel2.y;
					const relVelMag = Math.sqrt(relVelX * relVelX + relVelY * relVelY);

					// --- Determine Volume and Play Sound ---
					if (relVelMag >= MIN_VELOCITY_FOR_SOUND) {
						// Check global time-based cooldown first

						// Map velocity to volume
						const volume = mapRange(
							relVelMag,
							MIN_VELOCITY_FOR_SOUND,
							MAX_VELOCITY_FOR_MAX_VOL,
							MIN_COLLISION_VOLUME,
							MAX_COLLISION_VOLUME
						);

						// Pitch based on the largest fruit involved in the collision
						const fruitA = collisionItemA instanceof Fruit ? collisionItemA : null;
						const fruitB = collisionItemB instanceof Fruit ? collisionItemB : null;
						const dominantFruit =
							fruitA && fruitB
								? fruitA.fruitIndex >= fruitB.fruitIndex
									? fruitA
									: fruitB
								: (fruitA ?? fruitB);
						const bumpRate = dominantFruit
							? (DROP_PITCH_RATES[dominantFruit.fruitIndex] ?? 1.0)
							: rate;

						// Play the sound using AudioManager

						this.audioManager.playSound('bump', { volume, rate: bumpRate });

						// Update the last play time
						this.lastBumpSoundTime = currentTime;
					}
				}
			}

			// Avoid processing if either collider is already part of a merge this step
			if (mergedHandlesThisStep.has(handle1) || mergedHandlesThisStep.has(handle2)) {
				return;
			}

			let fruitA: Fruit | undefined;
			let fruitB: Fruit | undefined;
			if (collisionItemA instanceof Fruit && collisionItemB instanceof Fruit) {
				fruitA = collisionItemA;
				fruitB = collisionItemB;
			} else {
				return;
			}

			// Ensure both colliders correspond to known fruit data and are valid
			if (!fruitA || !fruitB || !fruitA.body.isValid() || !fruitB.body.isValid()) {
				// One or both colliders might not be fruits (e.g., walls) or might have been removed
				return;
			}

			// Check if fruits are the same type
			if (fruitA.fruitIndex === fruitB.fruitIndex) {
				// Ensure consistent order (optional, but good practice)
				const handleA = Math.min(handle1, handle2);
				const handleB = Math.max(handle1, handle2);
				mergePairs.push({ fruitA, fruitB });

				// Mark handles as merged for this step
				mergedHandlesThisStep.add(handleA);
				mergedHandlesThisStep.add(handleB);
			}
		});

		// --- Step 2: Process Queued Merges and Bomb Collisions ---
		// First, handle bomb collisions
		const fruitsToRemove: Fruit[] = [];
		for (const bomb of this.bombs) {
			for (const fruit of this.fruits) {
				if (bomb.body.isValid() && fruit.body.isValid()) {
					// Simple distance-based collision check
					const bombPos = bomb.body.translation();
					const fruitPos = fruit.body.translation();
					const distance = Math.sqrt(
						(bombPos.x - fruitPos.x) ** 2 + (bombPos.y - fruitPos.y) ** 2
					);
					if (distance < bomb.radius + fruit.radius) {
						// Collision detected - mark fruit for removal
						if (!fruitsToRemove.includes(fruit)) {
							fruitsToRemove.push(fruit);
						}
					}
				}
			}
		}

		// Remove hit fruits and add their points
		fruitsToRemove.forEach((fruit) => {
			const fruitPos = fruit.body.translation();
			const currentTime = performance.now();

			// Add points for destroyed fruit
			this.setScore(this.score + fruit.points);

			// Create score text animation at fruit position
			const newScoreTexts = [
				...this.scoreTexts,
				{
					id: this.scoreTextIdCounter++,
					x: fruitPos.x,
					y: fruitPos.y,
					score: fruit.points,
					comboCount: 0, // No combo for bomb kills
					startTime: currentTime,
					duration: 1500
				}
			];
			this.setScoreTexts(newScoreTexts);

			// Clear death indicator if this was the dying fruit
			if (this.gameOverFruitId === fruit.id) {
				this.gameOverFruitId = null;
			}

			this.colliderMap.delete(fruit.collider.handle);
			fruit.destroy();
		});
		this.fruits = this.fruits.filter((fruit) => !fruitsToRemove.includes(fruit));

		if (mergePairs.length > 0) {
			mergePairs.forEach(({ fruitA, fruitB }) => {
				// mergeFruits will handle validity checks internally now
				this.mergeFruits(fruitA, fruitB);
			});
		}
	}

	createBounds() {
		// Create walls (walls don't need collision events for merging)
		this.createWall(WALL_THICKNESS / -2, GAME_HEIGHT / 2, WALL_THICKNESS, GAME_HEIGHT); // left
		this.createWall(GAME_WIDTH + WALL_THICKNESS / 2, GAME_HEIGHT / 2, WALL_THICKNESS, GAME_HEIGHT); // right
		this.createWall(GAME_WIDTH / 2, GAME_HEIGHT + WALL_THICKNESS / 2, GAME_WIDTH, WALL_THICKNESS); // floor
	}

	createWall(x: number, y: number, width: number, height: number): void {
		if (!this.physicsWorld) {
			console.error('Cannot create wall: Physics world not initialized.');
			return;
		}

		const boundary = new Boundary(x, y, width, height, this.physicsWorld);

		this.colliderMap.set(boundary.collider.handle, boundary);
	}

	mergeFruits(fruitA: Fruit, fruitB: Fruit): void {
		if (!this.physicsWorld) {
			console.error('Cannot merge fruits: Physics world not initialized.');
			return;
		}

		// Check if data exists and bodies are valid
		if (!fruitA.body.isValid() || !fruitB.body.isValid()) {
			console.warn(
				`Attempted to merge handles ${fruitA.body.handle}, ${fruitB.body.handle}, but data/body was missing or invalid. Might have been merged already.`
			);
			return;
		}

		// --- Rest of the merge logic is similar, using bodyAData/bodyBData ---
		const posA = fruitA.body.translation();
		const posB = fruitB.body.translation();
		const midpoint = {
			x: (posA.x + posB.x) / 2,
			y: (posA.y + posB.y) / 2
		};

		const nextIndex = fruitA.fruitIndex === FRUITS.length - 1 ? 0 : fruitA.fruitIndex + 1;
		const nextFruitType = FRUITS[nextIndex];
		if (!nextFruitType) {
			console.error(`Invalid next fruit index during merge: ${nextIndex}`);
			return;
		}
		const newFruitRadius = nextFruitType.radius;

		// 1. Remove the old bodies from the physics world *first*
		fruitA.destroy();
		fruitB.destroy();

		// 2. Remove from collider map
		this.colliderMap.delete(fruitA.body.handle);
		this.colliderMap.delete(fruitB.body.handle);

		// 3. Filter the local fruits array *immediately* using handles
		this.fruits = this.fruits.filter((fruit) => {
			return fruit !== fruitA && fruit !== fruitB;
		});

		// Add merge visual effect
		const newMergeEffects = [
			...this.mergeEffects,
			{
				id: this.mergeEffectIdCounter++,
				x: midpoint.x,
				y: midpoint.y,
				radius: newFruitRadius,
				startTime: performance.now(),
				duration: 1000
			}
		];
		this.setMergeEffects(newMergeEffects);

		// 4. Add the new, larger fruit (addFruit will update map and array)
		this.addFruit(nextIndex, midpoint.x, midpoint.y);

		// Track Milestone
		const points = nextFruitType.points || 0;
		this.telemetry.trackMilestone(points, nextIndex, this.dropCount);

		// Update the score
		this.setScore(this.score + points);

		// --- Combo Tracking & Score Text ---
		const currentTime = performance.now();
		const timeSinceLastMerge = currentTime - this.lastMergeTime;
		const COMBO_WINDOW = 1000; // 1 second window for combo

		if (timeSinceLastMerge > COMBO_WINDOW) {
			// Combo expired, reset
			this.currentComboCount = 1;
		} else {
			// Still in combo window, increment
			this.currentComboCount++;
		}

		this.lastMergeTime = currentTime;

		// Add score text display
		const newScoreTexts = [
			...this.scoreTexts,
			{
				id: this.scoreTextIdCounter++,
				x: midpoint.x,
				y: midpoint.y,
				score: points,
				comboCount: this.currentComboCount,
				startTime: currentTime,
				duration: 1500
			}
		];
		this.setScoreTexts(newScoreTexts);
	}

	addFruit(fruitIndex: number, x: number, y: number): Fruit | undefined {
		if (!this.physicsWorld) {
			console.error('Cannot add fruit: Physics world not initialized.');
			return;
		}

		const fruit = new Fruit(fruitIndex, x, y, this.physicsWorld);

		if (!fruit) {
			console.error(`Invalid fruitIndex: ${fruitIndex}`);
			return;
		}

		// update current state of fruits
		this.fruits = [...this.fruits, fruit];

		this.colliderMap.set(fruit.collider.handle, fruit);
		return fruit;
	}

	dropFruit(fruitIndex: number, x: number, y: number): void {
		this.addFruit(fruitIndex, x, y);
		this.setCurrentFruitIndex(this.nextFruitIndex);
		this.setNextFruitIndex(this.getRandomFruitIndex());
		this.setDropCount(this.dropCount + 1);
	}

	checkGameOver(): void {
		if (this.status === 'gameover') return;

		for (const fruit of this.fruits) {
			// Check if fruit is dying and set visual indicator
			if (fruit.isDying) {
				this.gameOverFruitId = fruit.id;
			}

			// Check if fruit should end the game
			if (fruit.isOutOfBounds()) {
				this.gameOverFruitId = fruit.id;
				this.setStatus('gameover');
				break;
			}
		}

		// Clear death indicator if no fruit is dying
		if (!this.fruits.some((fruit) => fruit.isDying)) {
			this.gameOverFruitId = null;
		}
	}

	/** Resets the game state, physics world, and clears the map */
	resetGame(): void {
		if (this.physicsWorld) {
			this.fruits.forEach((fruit) => {
				fruit.destroy();
			});
			this.bombs.forEach((bomb) => {
				bomb.destroy();
			});
		}

		// Clear internal state
		this.fruits = [];
		this.bombs = [];
		this.lastTime = null;
		this.mergeEffectIdCounter = 0;
		this.scoreTextIdCounter = 0;
		this.dropCount = 0;
		this.lastMergeTime = 0;
		this.currentComboCount = 0;
		this.shakesRemaining = 3;
		this.isShaking = false;
		this.bombsRemaining = 2;
		this.popAllRemaining = 2;
		this.selectedFruitTypeIndex = null;
		this.telemetry.reset();
		this.leaderboard.reset();

		this.gameOverFruitId = null;

		// Reset Svelte stores
		this.setFruitsState([]);
		this.setMergeEffects([]);
		this.setScoreTexts([]);
		this.setBombsState([]);
		this.setScore(0);
		this.setStatus('uninitialized'); // Set to uninitialized, GameHeader will transition to playing
		this.setCurrentFruitIndex(this.getRandomFruitIndex());
		this.setNextFruitIndex(this.getRandomFruitIndex());
	}

	restartGame(): void {
		this.resetGame();
		this.startNewSession();
		this.setStatus('playing');
	}

	private startNewSession(): void {
		this.leaderboard.startSession().then(() => {
			const token = this.leaderboard.sessionToken;
			if (token) {
				this.telemetry.setSession(token);
			}
		});
	}

	getRandomFruitIndex(limit: number = 5) {
		return Math.floor(Math.random() * limit);
	}

	setScore(newScore: number) {
		this.score = newScore;
	}

	setStatus(newStatus: GameStatus) {
		const oldStatus = this.status;
		this.status = newStatus;

		if (newStatus === 'playing') {
			if (oldStatus !== 'playing') {
				this.lastTime = performance.now(); // Reset lastTime for correct delta on resume
				if (!this.animationFrameId) {
					// Avoid multiple loops
					this.update();
				}
			}
		} else if (['paused', 'gameover', 'uninitialized'].includes(newStatus)) {
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId);
				this.animationFrameId = null;
			}
		}
	}

	setCurrentFruitIndex(newCurrentFruitIndex: number) {
		this.currentFruitIndex = newCurrentFruitIndex;
	}

	setNextFruitIndex(newNextFruitIndex: number) {
		this.nextFruitIndex = newNextFruitIndex;
	}

	setFruitsState(newFruits: FruitState[]) {
		this.fruitsState = newFruits;
	}

	setDropCount(newDropCount: number) {
		this.dropCount = newDropCount;
	}

	setMergeEffects(newMergeEffects: MergeEffectData[]) {
		this.mergeEffects = newMergeEffects;
	}

	setScoreTexts(newScoreTexts: ScoreTextData[]) {
		this.scoreTexts = newScoreTexts;
	}

	setBombsState(newBombsState: typeof this.bombsState) {
		this.bombsState = newBombsState;
	}

	setSelectedFruitTypeIndex(index: number | null) {
		this.selectedFruitTypeIndex = index;
	}

	useShake(): void {
		if (this.shakesRemaining <= 0 || this.status !== 'playing') {
			return;
		}

		this.shakesRemaining--;
		this.isShaking = true;

		// Reset shake animation after 600ms
		setTimeout(() => {
			this.isShaking = false;
		}, 600);

		// Apply shake impulse to all fruits
		if (this.physicsWorld) {
			for (const fruit of this.fruits) {
				if (fruit.body.isValid()) {
					// Apply a random impulse to shake the fruit
					const shakeForceX = (Math.random() - 0.5) * 0.8;
					const shakeForceY = Math.random() * 0.8 - 0.1;
					fruit.body.applyImpulse({x: shakeForceX, y: shakeForceY}, true);
				}
			}
		}
	}

	useBomb(): void {
		if (this.bombsRemaining <= 0 || this.status !== 'playing' || !this.physicsWorld) {
			return;
		}

		this.bombsRemaining--;

		// Drop bomb at center-top of game area
		const bombX = GAME_WIDTH / 2;
		const bombY = GAME_HEIGHT * 0.1; // Top area
		const bomb = new Bomb(bombX, bombY, this.physicsWorld);

		this.bombs = [...this.bombs, bomb];
		this.colliderMap.set(bomb.collider.handle, bomb);
	}

	usePopAll(fruitIndex: number): void {
		if (this.popAllRemaining <= 0 || this.status !== 'playing') {
			return;
		}

		this.popAllRemaining--;

		// Find all fruits matching this type
		const fruitsToRemove = this.fruits.filter((fruit) => fruit.fruitIndex === fruitIndex);

		// Destroy fruits one by one with 0.5s delay
		fruitsToRemove.forEach((fruit, index) => {
			setTimeout(() => {
				// Safety check: ensure fruit physics body is still valid
				// It might have been destroyed by merge, bomb, or game reset during the delay
				if (!fruit.body.isValid()) {
					return;
				}

				// Play pop sound
				if (this.audioManager) {
					const popRate = DROP_PITCH_RATES[fruit.fruitIndex] ?? 1.0;
					this.audioManager.playSound('pop', {volume: 1, rate: popRate});
				}

				const fruitPos = fruit.body.translation();

				// Add points for destroyed fruit
				this.setScore(this.score + fruit.points);

				// Create score text animation at fruit position
				const newScoreTexts = [
					...this.scoreTexts,
					{
						id: this.scoreTextIdCounter++,
						x: fruitPos.x,
						y: fruitPos.y,
						score: fruit.points,
						comboCount: 0, // No combo for pop all
						startTime: performance.now(),
						duration: 1500
					}
				];
				this.setScoreTexts(newScoreTexts);

				// Clear death indicator if this was the dying fruit
				if (this.gameOverFruitId === fruit.id) {
					this.gameOverFruitId = null;
				}

				this.colliderMap.delete(fruit.collider.handle);
				fruit.destroy();

				// Remove from fruits array immediately to prevent physics/logic errors with "ghost" fruits
				this.fruits = this.fruits.filter((f) => f !== fruit);
			}, index * 500); // 0.5s delay between each fruit
		});

		// Clear selection immediately
		this.selectedFruitTypeIndex = null;
	}

	destroy() {
		console.log('destroy Game State');
		this.setStatus('gameover'); // Ensure loop stops and cleanup occurs
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
		// Any other cleanup specific to destroying the game instance
	}
}
