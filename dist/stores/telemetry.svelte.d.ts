import type { GameMilestone } from '../types/leaderboard';
export declare class TelemetryState {
    sessionToken: string | null;
    sessionStartTime: number | null;
    milestones: GameMilestone[];
    fetchSession(): Promise<void>;
    trackMilestone(points: number, fruitIndex: number, dropCount: number): void;
    submitGlobalScore(username: string, finalScore: number): Promise<any>;
    reset(): void;
}
