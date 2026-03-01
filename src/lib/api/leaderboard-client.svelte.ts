import { env } from '$env/dynamic/public';

interface GlobalScoreResponse {
	id: number;
	score: number;
	created_at: string;
	username?: string;
}

export interface LeaderboardScore {
	id: number;
	score: number;
	date: Date;
	username?: string;
}

type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';
type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export class LeaderboardClient {
	// --- Global Scores ---
	globalScores: LeaderboardScore[] = $state([]);
	globalScoresStatus: AsyncStatus = $state('idle');

	async fetchGlobalScores(): Promise<void> {
		if (this.globalScoresStatus === 'loading') return;

		this.globalScoresStatus = 'loading';
		try {
			const res = await fetch(`${env.PUBLIC_LEADERBOARD_URL}/api/leaderboard`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const data = await res.json();
			this.globalScores = data.scores.map((s: GlobalScoreResponse) => ({
				id: s.id,
				score: s.score,
				username: s.username,
				date: new Date(s.created_at)
			}));
			this.globalScoresStatus = 'success';
		} catch (err) {
			console.error('Failed to fetch global scores', err);
			this.globalScoresStatus = 'error';
		}
	}

	// --- Session ---
	sessionToken: string | null = $state(null);

	async startSession(): Promise<void> {
		try {
			const res = await fetch(`${env.PUBLIC_LEADERBOARD_URL}/api/leaderboard/start`, {
				method: 'POST'
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const data = await res.json();
			this.sessionToken = data.token;
		} catch (err) {
			console.error('Failed to start session', err);
			this.sessionToken = null;
		}
	}

	// --- Score Submission ---
	submissionStatus: SubmissionStatus = $state('idle');

	async submitScore(
		payload: Record<string, unknown>
	): Promise<{ success: boolean; error?: string }> {
		this.submissionStatus = 'submitting';
		try {
			const res = await fetch(`${env.PUBLIC_LEADERBOARD_URL}/api/leaderboard/submit`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const data = await res.json();

			if (data.success) {
				this.submissionStatus = 'success';
				// Auto-refresh global scores after successful submission
				this.globalScoresStatus = 'idle';
				await this.fetchGlobalScores();
			} else {
				this.submissionStatus = 'error';
			}

			return data;
		} catch (err) {
			console.error('Score submission failed', err);
			this.submissionStatus = 'error';
			return { success: false, error: 'Network error submitting score' };
		}
	}

	// --- Lifecycle ---
	reset(): void {
		this.sessionToken = null;
		this.submissionStatus = 'idle';
		// Keep globalScores cached across games — they're still valid
	}
}
