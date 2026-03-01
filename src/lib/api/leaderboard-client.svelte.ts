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
	// --- Daily Scores ---
	dailyScores: LeaderboardScore[] = $state([]);
	dailyScoresStatus: AsyncStatus = $state('idle');

	async fetchDailyScores(): Promise<void> {
		if (this.dailyScoresStatus === 'loading') return;

		this.dailyScoresStatus = 'loading';
		try {
			const res = await fetch(`${env.PUBLIC_LEADERBOARD_URL}/api/leaderboard?type=daily`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const data = await res.json();
			this.dailyScores = data.scores.map((s: GlobalScoreResponse) => ({
				id: s.id,
				score: s.score,
				username: s.username,
				date: new Date(s.created_at)
			}));
			this.dailyScoresStatus = 'success';
		} catch (err) {
			console.error('Failed to fetch daily scores', err);
			this.dailyScoresStatus = 'error';
		}
	}

	// --- Overall Scores ---
	overallScores: LeaderboardScore[] = $state([]);
	overallScoresStatus: AsyncStatus = $state('idle');

	async fetchOverallScores(): Promise<void> {
		if (this.overallScoresStatus === 'loading') return;

		this.overallScoresStatus = 'loading';
		try {
			const res = await fetch(`${env.PUBLIC_LEADERBOARD_URL}/api/leaderboard?type=overall`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const data = await res.json();
			this.overallScores = data.scores.map((s: GlobalScoreResponse) => ({
				id: s.id,
				score: s.score,
				username: s.username,
				date: new Date(s.created_at)
			}));
			this.overallScoresStatus = 'success';
		} catch (err) {
			console.error('Failed to fetch overall scores', err);
			this.overallScoresStatus = 'error';
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
	editToken: string | null = $state(null);
	submittedId: number | null = $state(null);
	submittedRank: number | null = $state(null);

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
				this.editToken = data.editToken ?? null;
				this.submittedId = data.id ?? null;
				this.submittedRank = data.rank ?? null;

				if (data.scores) {
					this.dailyScores = data.scores.map((s: GlobalScoreResponse) => ({
						id: s.id,
						score: s.score,
						username: s.username,
						date: new Date(s.created_at)
					}));
					this.dailyScoresStatus = 'success';
				}
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

	// --- Update Username ---
	async updateUsername(username: string): Promise<void> {
		if (!this.editToken || !this.submittedId) return;

		try {
			const res = await fetch(`${env.PUBLIC_LEADERBOARD_URL}/api/leaderboard/update-username`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ editToken: this.editToken, username })
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const id = this.submittedId;
			this.dailyScores = this.dailyScores.map((s) => (s.id === id ? { ...s, username } : s));
		} catch (err) {
			console.error('Failed to update username', err);
		}
	}

	// --- Lifecycle ---
	reset(): void {
		this.sessionToken = null;
		this.submissionStatus = 'idle';
		this.editToken = null;
		this.submittedId = null;
		this.submittedRank = null;
		// Keep scores cached across games — they're still valid
	}
}
