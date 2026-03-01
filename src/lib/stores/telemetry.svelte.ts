import { env } from '$env/dynamic/public';
import { APP_VERSION, BUILD_HASH } from '../buildInfo';
import type { GameMilestone } from '../types/leaderboard';

export class TelemetryState {
	sessionStartTime: number | null = null;
	milestones: GameMilestone[] = [];

	setSession(_token: string): void {
		this.sessionStartTime = performance.now();
	}

	trackMilestone(points: number, fruitIndex: number, dropCount: number): void {
		if (this.sessionStartTime && points > 0) {
			this.milestones.push({
				timeOffsetMs: performance.now() - this.sessionStartTime,
				scoreIncrement: points,
				fruitIndex,
				dropCount
			});
		}
	}

	async buildSubmissionPayload(
		username: string,
		finalScore: number,
		sessionToken: string
	): Promise<Record<string, unknown> | null> {
		if (this.milestones.length === 0) {
			console.error('Cannot build submission payload: no milestones recorded');
			return null;
		}

		const payloadString = `${username}:${finalScore}:${sessionToken}:${JSON.stringify(this.milestones)}:${env.PUBLIC_SHARED_CLIENT_SALT}`;
		const encoder = new TextEncoder();
		const dataBytes = encoder.encode(payloadString);
		const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const validationHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

		return {
			username,
			finalScore,
			sessionToken,
			milestones: this.milestones,
			validationHash,
			clientVersion: APP_VERSION,
			buildHash: BUILD_HASH
		};
	}

	reset(): void {
		this.milestones = [];
		this.sessionStartTime = null;
	}
}
