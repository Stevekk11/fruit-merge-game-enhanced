import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeWebAnalytics } from '../web-analytics';
import posthog from 'posthog-js';

vi.mock('posthog-js', () => ({
	default: {
		init: vi.fn()
	}
}));

vi.mock('esm-env', () => ({
	BROWSER: true
}));

describe('initializeWebAnalytics', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('initializes posthog when token is provided', () => {
		initializeWebAnalytics('test-token');
		expect(posthog.init).toHaveBeenCalledWith('test-token', {
			api_host: 'https://us.i.posthog.com',
			person_profiles: 'identified_only'
		});
	});

	it('does not initialize posthog without a token', () => {
		initializeWebAnalytics('');
		expect(posthog.init).not.toHaveBeenCalled();
	});
});
