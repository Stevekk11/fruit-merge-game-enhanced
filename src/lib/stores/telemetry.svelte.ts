import { env } from '$env/dynamic/public';
import { APP_VERSION, BUILD_HASH } from '../buildInfo';
import type { GameMilestone } from '../types/leaderboard';

export class TelemetryState {
	sessionToken: string | null = $state(null);
	sessionStartTime: number | null = null;
	milestones: GameMilestone[] = [];

	async fetchSession() {
		try {
			// Ensure we're targeting the absolute URL of the standalone leaderboard server
			const res = await fetch('http://localhost:4033/api/leaderboard/start', { method: 'POST' });
			if (res.ok) {
				const data = await res.json();
				this.sessionToken = data.token;
				this.sessionStartTime = performance.now(); // local monotonic start time
				console.log('Got session token.');
			} else {
				console.error('Failed to get session token.', res.statusText);
			}
		} catch (err) {
			console.error('Network error getting session token:', err);
		}
	}

	trackMilestone(points: number, fruitIndex: number, dropCount: number) {
		if (this.sessionStartTime && points > 0) {
			this.milestones.push({
				timeOffsetMs: performance.now() - this.sessionStartTime,
				scoreIncrement: points,
				fruitIndex,
				dropCount
			});
		}
	}

	async submitGlobalScore(username: string, finalScore: number) {
		if (!this.sessionToken || this.milestones.length === 0) {
			console.error('Cannot submit global score: missing session data');
			return { success: false, error: 'Missing session data' };
		}

		try {
			const payloadString = `${username}:${finalScore}:${this.sessionToken}:${JSON.stringify(this.milestones)}:${env.PUBLIC_SHARED_CLIENT_SALT}`;
			const encoder = new TextEncoder();
			const dataBytes = encoder.encode(payloadString);
			const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			const validationHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

			const payload = {
				username,
				finalScore,
				sessionToken: this.sessionToken,
				milestones: this.milestones,
				validationHash,
				clientVersion: APP_VERSION,
				buildHash: BUILD_HASH
			};

			const res = await fetch('http://localhost:4033/api/leaderboard/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const data = await res.json();
			return data;
		} catch (err) {
			console.error('Submission failed', err);
			return { success: false, error: 'Network error submitting score' };
		}
	}

	reset() {
		this.milestones = [];
		this.sessionStartTime = null;
		this.sessionToken = null;
	}
}
