import { describe, expect, it } from 'vitest';
import data from '@emoji-mart/data/sets/15/native.json';
import { emojiQuery, searchEmoji } from './emoji-autocomplete';
import { insertText } from './draft';

describe('emoji autocomplete', () => {
	it('finds a shortcode at the caret and includes its remaining suffix for replacement', () => {
		expect(emojiQuery(['hello :smile'], 12)).toEqual({ query: 'smile', start: 6, end: 12 });
		expect(emojiQuery(['hello :smile there'], 10)).toEqual({ query: 'smi', start: 6, end: 12 });
		expect(emojiQuery([':'], 1)).toBeUndefined();
	});

	it('leaves one-letter emoticons alone, so Enter still sends them', () => {
		expect(emojiQuery(['lol :D'], 6)).toBeUndefined();
		expect(emojiQuery(['ok :p'], 5)).toBeUndefined();
		expect(emojiQuery(['ok :pa'], 6)).toEqual({ query: 'pa', start: 3, end: 6 });
	});

	it('opens after a mention chip and a space', () => {
		expect(emojiQuery([{ id: 'ada' }, ' :wav'], 9)).toEqual({ query: 'wav', start: 5, end: 9 });
	});

	it('does not trigger in the middle of words, in email-like text, or across mention chips', () => {
		expect(emojiQuery(['hello:smile'], 11)).toBeUndefined();
		expect(emojiQuery(['mail@example.com'], 12)).toBeUndefined();
		expect(emojiQuery([{ id: 'ada' }, ':smile'], 10)).toBeUndefined();
	});

	it('keeps replacement offsets correct after a mention chip', () => {
		const parts = [{ id: 'ada' }, ' text :smile after'];
		const found = emojiQuery(parts, 16);

		expect(found).toEqual({ query: 'smile', start: 10, end: 16 });
		expect(insertText(parts, found!.start, found!.end, '😄')).toEqual({
			parts: [{ id: 'ada' }, ' text 😄 after'],
			caret: 12
		});
	});

	it('finds emoji by shortcode and keyword, with exact matches first', () => {
		expect(searchEmoji(data, 'smile')[0]?.id).toBe('smile');
		expect(searchEmoji(data, 'joy').some((item) => item.id === 'joy')).toBe(true);
		expect(searchEmoji(data, '').length).toBe(0);
	});
});
