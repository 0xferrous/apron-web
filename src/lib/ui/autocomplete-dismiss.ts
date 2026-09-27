/** The draft position at which Escape dismissed an inline autocomplete picker. */
export interface DismissedAutocomplete {
	text: string;
	caret: number;
}

/** Whether the picker should stay dismissed while the draft is unchanged. */
export function isAutocompleteDismissed(
	dismissed: DismissedAutocomplete | undefined,
	text: string,
	caret: number
): boolean {
	return dismissed?.text === text && dismissed.caret === caret;
}
