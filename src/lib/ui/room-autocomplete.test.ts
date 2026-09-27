import { describe, expect, it } from 'vitest';
import { insertRoomMention, roomQuery, searchRooms, type RoomSuggestion } from './room-autocomplete';

const rooms: RoomSuggestion[] = [
	{ id: 'general', title: 'General' },
	{ id: 'deploys', title: 'Deploys' },
	{ id: 'ops-east', title: 'Operations East' },
	{ id: 'ops-west', title: 'Operations West' }
];

describe('room autocomplete', () => {
	it('finds a #room ID at the caret and includes the rest of the token', () => {
		expect(roomQuery(['hi #dep'], 7)).toEqual({ query: 'dep', start: 3, end: 7 });
		expect(roomQuery(['hi #deploys!'], 7)).toEqual({ query: 'dep', start: 3, end: 11 });
		expect(roomQuery(['hi #'], 4)).toEqual({ query: '', start: 3, end: 4 });
		expect(roomQuery(['a#deploys'], 9)).toBeUndefined();
		expect(roomQuery([{ id: 'bob' }, ' #dep'], 9)).toEqual({ query: 'dep', start: 5, end: 9 });
		expect(roomQuery([{ id: 'bob' }, '#dep'], 8)).toBeUndefined();
	});

	it('searches IDs and titles, prioritizing exact and prefix matches', () => {
		expect(searchRooms(rooms, 'ops')).toEqual([rooms[2], rooms[3]]);
		expect(searchRooms(rooms, 'operations west')).toEqual([rooms[3]]);
		expect(searchRooms(rooms, 'deploys')).toEqual([rooms[1]]);
		expect(searchRooms(rooms, 'missing')).toEqual([]);
	});

	it('replaces a typed ID with its canonical ID and keeps one separating space', () => {
		expect(insertRoomMention(['hi #dep!'], 3, 7, 'deploys')).toEqual({ parts: ['hi #deploys !'], caret: 12 });
		expect(insertRoomMention(['hi #dep next'], 3, 7, 'deploys')).toEqual({ parts: ['hi #deploys next'], caret: 11 });
	});
});
