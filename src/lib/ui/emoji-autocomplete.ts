import type { EmojiMartData } from '@emoji-mart/data';
import type { DraftPart } from './draft';

export interface EmojiQuery {
	query: string;
	start: number;
	end: number;
}

export interface EmojiSuggestion {
	id: string;
	name: string;
	native: string;
}

const SHORTCODE = /^[\w+-]$/;
const MAX_MATCHES = 8;

/** Finds a :shortcode at the caret in draft text, stopping at chips and whitespace. */
export function emojiQuery(parts: DraftPart[], caret: number): EmojiQuery | undefined {
	let offset = 0;
	for (const [index, part] of parts.entries()) {
		const length = typeof part === 'string' ? part.length : part.id.length + 1;
		if (typeof part === 'string' && caret >= offset && caret <= offset + length) {
			const localCaret = caret - offset;
			const before = part.slice(0, localCaret);
			const match = /(?:^|\s):([\w+-]{1,32})$/i.exec(before);
			if (!match) return undefined;
			const atStart = match.index === 0;
			const previous = index > 0 ? parts[index - 1] : undefined;
			if (atStart && previous !== undefined && (typeof previous !== 'string' || !/\s$/.test(previous))) return undefined;
			const start = offset + match.index + match[0].lastIndexOf(':');
			let end = caret;
			while (end - offset < part.length && SHORTCODE.test(part[end - offset])) end++;
			return { query: match[1], start, end };
		}
		offset += length;
	}
	return undefined;
}

/** Search emoji IDs, names, aliases and keywords, returning native glyphs. */
export function searchEmoji(data: EmojiMartData, query: string): EmojiSuggestion[] {
	const needle = query.trim().toLowerCase().replace(/^:/, '');
	if (!needle) return [];
	const scored: Array<{ emoji: EmojiSuggestion; rank: number }> = [];
	const aliasesById = new Map<string, string[]>();
	for (const [alias, id] of Object.entries(data.aliases)) aliasesById.set(id, [...(aliasesById.get(id) ?? []), alias]);
	for (const [id, item] of Object.entries(data.emojis)) {
		const aliases = aliasesById.get(id) ?? [];
		const candidates = [id, item.name, ...item.keywords, ...aliases].map((value) => value.toLowerCase());
		const rank = id.toLowerCase() === needle ? 0 : candidates.some((value) => value === needle) ? 1 : candidates.some((value) => value.startsWith(needle)) ? 2 : candidates.some((value) => value.includes(needle)) ? 3 : -1;
		if (rank >= 0) {
			const native = item.skins[0]?.native;
			if (native) scored.push({ emoji: { id, name: item.name, native }, rank });
		}
	}
	return scored.sort((a, b) => a.rank - b.rank || a.emoji.id.localeCompare(b.emoji.id)).slice(0, MAX_MATCHES).map(({ emoji }) => emoji);
}
