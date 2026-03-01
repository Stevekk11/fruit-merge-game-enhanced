export interface GlobalScore {
	id: number;
	username: string;
	score: number;
	duration_ms: number;
	created_at: string;
}

export interface GameMilestone {
	timeOffsetMs: number;
	scoreIncrement: number;
	fruitIndex: number;
	dropCount: number;
}

export interface ScoreSubmissionPayload {
	username: string;
	finalScore: number;
	sessionToken: string;
	milestones: GameMilestone[];
	validationHash: string; // the client-side salted hash
}

export interface SessionPayload {
	startedAt: number;
}
