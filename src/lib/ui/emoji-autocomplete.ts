import type { EmojiMartData } from '@emoji-mart/data';
import { tokenAtCaret, type CaretToken, type DraftPart } from './draft';

export type EmojiQuery = CaretToken;

export interface EmojiSuggestion {
	id: string;
	name: string;
	native: string;
}

const SHORTCODE_CHAR = /[\w+-]/;
/** One letter after `:` is an emoticon (`:D`, `:p`), not a shortcode, so it never opens the picker. */
const MIN_QUERY = 2;
const MAX_QUERY = 32;
const MAX_MATCHES = 8;

/** Finds a :shortcode at the caret in draft text, stopping at chips and whitespace. */
export function emojiQuery(parts: DraftPart[], caret: number): EmojiQuery | undefined {
	const found = tokenAtCaret(parts, caret, ':', SHORTCODE_CHAR, MIN_QUERY);
	return found && found.query.length <= MAX_QUERY ? found : undefined;
}

interface IndexedEmoji {
	emoji: EmojiSuggestion;
	/** The lowercased ID, then its name, keywords and aliases. */
	terms: string[];
}

/** Each data set is indexed once, on its first search, rather than on every keystroke. */
const indexes = new WeakMap<EmojiMartData, IndexedEmoji[]>();

function indexOf(data: EmojiMartData): IndexedEmoji[] {
	let index = indexes.get(data);
	if (index) return index;
	const aliasesById = new Map<string, string[]>();
	for (const [alias, id] of Object.entries(data.aliases)) aliasesById.set(id, [...(aliasesById.get(id) ?? []), alias]);
	index = [];
	for (const [id, item] of Object.entries(data.emojis)) {
		const native = item.skins[0]?.native;
		if (!native) continue;
		const terms = [id, item.name, ...item.keywords, ...(aliasesById.get(id) ?? [])].map((value) => value.toLowerCase());
		index.push({ emoji: { id, name: item.name, native }, terms });
	}
	indexes.set(data, index);
	return index;
}

/** Search emoji IDs, names, aliases and keywords, returning native glyphs. */
export function searchEmoji(data: EmojiMartData, query: string): EmojiSuggestion[] {
	const needle = query.trim().toLowerCase().replace(/^:/, '');
	if (!needle) return [];
	const scored: Array<{ emoji: EmojiSuggestion; rank: number }> = [];
	for (const { emoji, terms } of indexOf(data)) {
		const rank = terms[0] === needle ? 0 : terms.includes(needle) ? 1 : terms.some((value) => value.startsWith(needle)) ? 2 : terms.some((value) => value.includes(needle)) ? 3 : -1;
		if (rank >= 0) scored.push({ emoji, rank });
	}
	return scored.sort((a, b) => a.rank - b.rank || a.emoji.id.localeCompare(b.emoji.id)).slice(0, MAX_MATCHES).map(({ emoji }) => emoji);
}
