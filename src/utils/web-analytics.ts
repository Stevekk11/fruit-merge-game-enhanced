import posthog from 'posthog-js';

export function initializeWebAnalytics() {
	posthog.init(import.meta.env.VITE_POSTHOG_TOKEN, {
		api_host: 'https://us.i.posthog.com',
		person_profiles: 'identified_only' // or 'always' to create profiles for anonymous users as well
	});
}
