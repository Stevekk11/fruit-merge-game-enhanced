import { env } from '$env/dynamic/public';
export class TelemetryState {
    sessionToken = $state(null);
    sessionStartTime = null;
    milestones = [];
    async fetchSession() {
        try {
            const res = await fetch('/api/leaderboard/start', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                this.sessionToken = data.token;
                this.sessionStartTime = performance.now(); // local monotonic start time
                console.log('Got session token.');
            }
            else {
                console.error('Failed to get session token.', res.statusText);
            }
        }
        catch (err) {
            console.error('Network error getting session token:', err);
        }
    }
    trackMilestone(points, fruitIndex, dropCount) {
        if (this.sessionStartTime && points > 0) {
            this.milestones.push({
                timeOffsetMs: performance.now() - this.sessionStartTime,
                scoreIncrement: points,
                fruitIndex,
                dropCount
            });
        }
    }
    async submitGlobalScore(username, finalScore) {
        if (!this.sessionToken || this.milestones.length === 0) {
            console.error('Cannot submit global score: missing session data');
            return { success: false, error: 'Missing session data' };
        }
        try {
            const payload = {
                username,
                finalScore,
                sessionToken: this.sessionToken,
                milestones: this.milestones,
                validationHash: env.PUBLIC_SHARED_CLIENT_SALT
            };
            const res = await fetch('/api/leaderboard/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            return data;
        }
        catch (err) {
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
