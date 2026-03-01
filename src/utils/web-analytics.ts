import { BROWSER } from 'esm-env';
import posthog from 'posthog-js';

/** @public */
export function initializeWebAnalytics(token: string) {
	if (BROWSER && token) {
		try {
			posthog.init(token, {
				api_host: 'https://us.i.posthog.com',
				person_profiles: 'identified_only'
			});
		} catch {
			// ignore
		}
	}
}
