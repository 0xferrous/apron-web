import { describe, expect, it } from 'vitest';
import { isAutocompleteDismissed, type DismissedAutocomplete } from './autocomplete-dismiss';

describe('inline autocomplete dismissal', () => {
	it('keeps Escape dismissed until the token or caret changes', () => {
		const dismissed: DismissedAutocomplete = { text: 'hi :smi', caret: 7 };

		// The keyup that follows Escape sees the same draft and stays closed.
		expect(isAutocompleteDismissed(dismissed, 'hi :smi', 7)).toBe(true);
		// Typing or moving the caret lets refreshQuery open the picker again.
		expect(isAutocompleteDismissed(dismissed, 'hi :smil', 8)).toBe(false);
		expect(isAutocompleteDismissed(dismissed, 'hi :smi', 6)).toBe(false);
	});
});
