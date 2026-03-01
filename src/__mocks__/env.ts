// Stub for $env/dynamic/public — used in tests only.
// In production, SvelteKit injects the real values at runtime.
export const env: Record<string, string> = {
	PUBLIC_SHARED_CLIENT_SALT: 'test-salt',
	PUBLIC_LEADERBOARD_URL: 'http://localhost:3001'
};
