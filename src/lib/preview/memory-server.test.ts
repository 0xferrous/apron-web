import { afterEach, describe, expect, it } from 'vitest';
import { ChatClient, timelineMessages } from '$lib/protocol/client';
import { MemoryProtocolServer } from './memory-server';

const clients: ChatClient[] = [];
afterEach(() => {
	for (const client of clients.splice(0)) client.stop();
});

async function waitFor(predicate: () => boolean): Promise<void> {
	for (let i = 0; i < 100; i++) {
		if (predicate()) return;
		await new Promise((resolve) => setTimeout(resolve, 5));
	}
	throw new Error('Preview protocol did not settle');
}

describe('in-memory preview protocol', () => {
	it('authenticates, lists seeded rooms, loads history, and handles app mutations', async () => {
		const server = new MemoryProtocolServer();
		const client = new ChatClient('ws://apron-preview.invalid', 'Preview User', server.factory);
		clients.push(client);
		client.start();
		await waitFor(() => client.snapshot().authenticated && client.snapshot().rooms.some((room) => room.id === 'general' && room.loaded));

		const general = client.snapshot().rooms.find((room) => room.id === 'general')!;
		expect(timelineMessages(general)).toHaveLength(9);
		await client.listRooms('general', 0);
		expect(client.snapshot().rooms.some((room) => room.id === 'thread_deploy')).toBe(true);
		await client.loadRoom('thread_deploy');
		expect(client.message('1710000000003')?.room_id).toBe('thread_deploy');
		const currentGeneral = client.snapshot().rooms.find((room) => room.id === 'general')!;
		expect(timelineMessages(currentGeneral).some((message) => message.message_id === '1710000000003')).toBe(false);

		const sent = await client.send('general', 'A message from the preview').promise;
		await waitFor(() => {
			const room = client.snapshot().rooms.find((candidate) => candidate.id === 'general');
			return room ? timelineMessages(room).some((message) => message.message_id === sent.message_id) : false;
		});
		await client.editMessage(sent.message_id, 'Edited in preview').promise;
		await client.react(timelineMessages(general)[0].message_id, ['✨']).promise;
		await client.updateProfile({ name: 'Preview Renamed' });
		await client.command('general', '/help').promise;

		const created = await client.createRoom({ parentRoomId: 'general', title: 'Preview thread' }).promise;
		await waitFor(() => client.snapshot().rooms.some((room) => room.id === created.room_id));
		expect(client.snapshot().rooms.find((room) => room.id === created.room_id)?.parentRoomId).toBe('general');
	});
});
