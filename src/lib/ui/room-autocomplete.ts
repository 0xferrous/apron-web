import { draftText, insertText, tokenAtCaret, type CaretToken, type DraftPart } from './draft';

export interface RoomSuggestion {
	id: string;
	title: string;
}

export type RoomQuery = CaretToken;

const ROOM_CHAR = /[A-Za-z0-9_.-]/;
const MAX_MATCHES = 8;

/** Finds a #room ID at the caret, stopping at chips and whitespace. */
export function roomQuery(parts: DraftPart[], caret: number): RoomQuery | undefined {
	return tokenAtCaret(parts, caret, '#', ROOM_CHAR);
}

/** Replaces the typed #room ID with its canonical ID and leaves one separating space. */
export function insertRoomMention(parts: DraftPart[], start: number, end: number, id: string): { parts: DraftPart[]; caret: number } {
	const after = draftText(parts).slice(end);
	return insertText(parts, start, end, `#${id}${/^\s/.test(after) ? '' : ' '}`);
}

/** Finds rooms by ID or title, preferring exact and then prefix matches. */
export function searchRooms(rooms: RoomSuggestion[], query: string): RoomSuggestion[] {
	const needle = query.trim().replace(/^#/, '').toLowerCase();
	return rooms
		.map((room) => {
			const id = room.id.toLowerCase();
			const title = room.title.toLowerCase();
			const rank = !needle ? 0 : id === needle || title === needle ? 0 : id.startsWith(needle) || title.startsWith(needle) ? 1 : id.includes(needle) || title.includes(needle) ? 2 : -1;
			return rank < 0 ? undefined : { room, rank };
		})
		.filter((entry) => entry !== undefined)
		.sort((a, b) => a.rank - b.rank || a.room.title.localeCompare(b.room.title) || a.room.id.localeCompare(b.room.id))
		.slice(0, MAX_MATCHES)
		.map(({ room }) => room);
}
