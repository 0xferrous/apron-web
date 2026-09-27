<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import type { ChatClient } from '$lib/protocol/client';

	interface Props {
		client: ChatClient;
		open?: boolean;
		/** Creating is allowed (cap `rooms`, signed in, not read-only); losing that closes the dialog. */
		enabled: boolean;
		/** The server named the new room; its record follows in a `room_update`. */
		oncreated: (roomId: string) => void;
	}
	let { client, open = $bindable(false), enabled, oncreated }: Props = $props();

	let dialog = $state<HTMLDialogElement | undefined>();
	let titleInput = $state<HTMLInputElement | undefined>();
	let title = $state('');
	let creating = $state(false);
	let error = $state('');

	$effect(() => {
		if (!dialog) return;
		if (open && !enabled) {
			open = false;
		} else if (open && !dialog.open) {
			title = '';
			error = '';
			dialog.showModal();
			titleInput?.focus();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	/** Escape does nothing while the room is being created, like the disabled buttons. */
	function cancel(event: Event): void {
		if (creating) event.preventDefault();
	}

	async function submit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		const name = title.trim();
		if (!name) {
			error = 'Enter a room name.';
			return;
		}
		if (!enabled || creating) return;
		creating = true;
		error = '';
		try {
			const result = await client.createRoom({ title: name }).promise;
			if (typeof result.room_id !== 'string' || !result.room_id) throw new Error('Invalid room response');
			oncreated(result.room_id);
			open = false;
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Unable to create room';
		} finally {
			creating = false;
		}
	}
</script>

<dialog class="create-room" bind:this={dialog} aria-labelledby="create-room-title" oncancel={cancel} onclose={() => (open = false)}>
	<form onsubmit={submit}>
		<header>
			<h2 id="create-room-title">Create a room</h2>
			<button class="ap-btn ap-btn-ghost ap-btn-sm" type="button" aria-label="Close" disabled={creating} onclick={() => (open = false)}><X size={16} aria-hidden="true" /></button>
		</header>
		<label for="create-room-name">Room name</label>
		<input id="create-room-name" class="ap-field" bind:this={titleInput} bind:value={title} autocomplete="off" required disabled={creating} />
		{#if error}<p class="error" role="alert">{error}</p>{/if}
		<div class="actions">
			<button class="ap-btn ap-btn-ghost ap-btn-sm" type="button" disabled={creating} onclick={() => (open = false)}>Cancel</button>
			<button class="ap-btn ap-btn-primary ap-btn-sm" type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create room'}</button>
		</div>
	</form>
</dialog>

<style>
	/* The same surface and backdrop as PreferencesDialog. */
	.create-room { width: min(420px, calc(100vw - 32px)); max-width: none; margin: auto; padding: 0; color: var(--ink); background: var(--bg-100); border: 1px solid var(--line); border-radius: var(--radius-lg); box-shadow: var(--shadow-popover); }
	.create-room::backdrop { background: rgba(5, 5, 12, .68); backdrop-filter: blur(2px); }
	form { display: flex; flex-direction: column; gap: var(--space-3); padding: var(--space-6); }
	header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
	h2 { margin: 0; font-size: 18px; line-height: 24px; }
	label { font-size: 13px; font-weight: 600; }
	.ap-field { width: 100%; box-sizing: border-box; }
	.error { margin: 0; color: var(--danger); font-size: 13px; }
	.actions { display: flex; justify-content: flex-end; gap: var(--space-2); margin-top: var(--space-2); }
</style>
