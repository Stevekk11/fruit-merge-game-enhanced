import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import ModalCreditsFooter from '../ModalCreditsFooter.svelte';
import { APP_VERSION } from '../../buildInfo';

afterEach(() => {
	cleanup();
});

describe('ModalCreditsFooter', () => {
	it('renders correctly and shows app version', () => {
		const { container } = render(ModalCreditsFooter);
		expect(container.textContent).toContain('Crafted by');
		expect(container.textContent).toContain(APP_VERSION);
	});
});
