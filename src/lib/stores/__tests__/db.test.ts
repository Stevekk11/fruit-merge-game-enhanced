import { expect, test, vi, describe, beforeEach } from 'vitest';
import Dexie from 'dexie';

// Unmock the global mock from setupFiles so we can test the real db
vi.unmock('./src/lib/stores/db');

describe('db.ts', () => {
	let saveScore: any;
	let getHighScores: any;
	let dbObj: any;

	beforeEach(async () => {
		vi.resetModules();

		// Dexie works natively in browser mode!
		const module = await import('../db');
		saveScore = module.saveScore;
		getHighScores = module.getHighScores;

		// Clear Dexie db to ensure clean tests
		// Wait, we need to access the db instance. It's not exported.
		// However, we can delete the database globally:
		await Dexie.delete('FruitMergerDB');
	});

	test('saving and retrieving scores works natively', async () => {
		await saveScore(100);
		await saveScore(500);
		await saveScore(300);

		const results = await getHighScores();

		expect(results.length).toBe(3);
		expect(results[0].score).toBe(500); // reverse sorted
		expect(results[1].score).toBe(300);
		expect(results[2].score).toBe(100);
	});

	test('getHighScores bounds at 10', async () => {
		for (let i = 0; i < 15; i++) {
			await saveScore(1000 + i * 10); // 1000, 1010, ... 1140
		}

		const results = await getHighScores();
		expect(results.length).toBe(10);
		expect(results[0].score).toBe(1140);
	});
});
