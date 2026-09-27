<script lang="ts">
	import type { SessionView } from '$lib/ui/session.svelte';
	import { directory } from '$lib/ui/directory.svelte';
	import Avatar from './Avatar.svelte';

	let { session, activeThread, open }: { session: SessionView; activeThread?: string; open: boolean } = $props();
	/** The open thread has its own membership; otherwise use the selected room. */
	let room = $derived(activeThread
		? session.rooms.find((candidate) => candidate.id === activeThread)
		: session.rooms.find((candidate) => candidate.id === session.activeRoomId));
	let members = $derived([...(room?.members ?? [])].sort((a, b) =>
		directory.name(a).localeCompare(directory.name(b), undefined, { sensitivity: 'base' }) || a.user_id.localeCompare(b.user_id)
	));
</script>

<aside class="member-list-sidebar" class:open aria-label="Room member list">
	<div class="people-head">
		<span class="people-title" role="heading" aria-level="2">Member list</span>
		{#if room?.members !== undefined}<span class="people-count">{room.members.length}</span>{/if}
	</div>
	<div class="people-body" data-testid="room-member-list">
		{#if !room}
			<p class="muted">Select a room to see its members.</p>
		{:else if room.members === undefined}
			<p class="muted">{session.canManageRooms ? 'Loading members…' : 'Members are unavailable on this server.'}</p>
		{:else if members.length === 0}
			<p class="muted">No members listed.</p>
		{:else}
			<ul class="people-list" aria-label={`Members of ${room.title}`}>
				{#each members as person (person.user_id)}
					{@const name = directory.name(person)}
					<li class="person" data-user={person.user_id}>
						<Avatar name={name} id={person.user_id} src={directory.avatar(person)} size="sm" />
						<span class="person-name" title={person.user_id}>
							{name}{#if directory.sharesName(person)}<small class="person-detail">@{person.user_id}</small>{/if}{#if directory.isMe(person.user_id)}<small class="person-detail">(you)</small>{/if}
						</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</aside>

<style>
	.member-list-sidebar { display: flex; flex-direction: column; min-width: 0; min-height: 0; background: var(--bg-000); border-left: 1px solid var(--line); }
	.member-list-sidebar:not(.open) { display: none; }
	.people-head { display: flex; align-items: center; gap: var(--space-2); height: var(--header-h); flex: none; padding: 0 var(--space-4); border-bottom: 1px solid var(--line); color: var(--ink); font-size: 15px; line-height: 20px; font-weight: 600; }
	.people-count { color: var(--ink-muted); font-size: 12px; font-weight: 500; font-variant-numeric: tabular-nums; }
	.people-body { flex: 1; min-height: 0; overflow: auto; padding: var(--space-3) var(--space-2); }
	.muted { margin: 0; padding: var(--space-1) var(--space-3); color: var(--ink-muted); font-size: 13px; line-height: 18px; }
	.people-list { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; }
	.person { display: flex; align-items: center; gap: var(--space-2); min-height: 32px; padding: 2px var(--space-1); color: var(--ink); font-size: 13px; line-height: 18px; }
	.person-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.person-name small { color: var(--ink-muted); font-size: 11px; }
	.person-name .person-detail { margin-left: 4px; }
	@media (max-width: 959px) {
		.member-list-sidebar.open { display: flex; position: absolute; z-index: 6; top: var(--header-h); right: 0; bottom: 0; width: min(280px, calc(100vw - 24px)); box-shadow: var(--shadow-float); }
	}
</style>
