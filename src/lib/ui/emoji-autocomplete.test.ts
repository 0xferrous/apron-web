import { describe, expect, it } from 'vitest';
import data from '@emoji-mart/data/sets/15/native.json';
import { emojiQuery, searchEmoji } from './emoji-autocomplete';

describe('emoji autocomplete', () => {
	it('finds a shortcode at the caret and includes its remaining suffix for replacement', () => {
		expect(emojiQuery(['hello :smile'], 12)).toEqual({ query: 'smile', start: 6, end: 12 });
		expect(emojiQuery(['hello :smile there'], 10)).toEqual({ query: 'smi', start: 6, end: 12 });
		expect(emojiQuery([':'], 1)).toBeUndefined();
	});

	it('does not trigger in the middle of words, in email-like text, or across mention chips', () => {
		expect(emojiQuery(['hello:smile'], 11)).toBeUndefined();
		expect(emojiQuery(['mail@example.com'], 12)).toBeUndefined();
		expect(emojiQuery([{ id: 'ada' }, ':smile'], 10)).toBeUndefined();
	});

	it('finds emoji by shortcode and keyword, with exact matches first', () => {
		expect(searchEmoji(data, 'smile')[0]?.id).toBe('smile');
		expect(searchEmoji(data, 'joy').some((item) => item.id === 'joy')).toBe(true);
		expect(searchEmoji(data, '').length).toBe(0);
	});
});
