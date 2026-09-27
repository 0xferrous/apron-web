<script lang="ts">
	import { mentionClass, mentionLabel, mentionSegments } from '$lib/protocol/markdown';
	import { directory } from '$lib/ui/directory.svelte';

	/**
	 * A line of plain message text, such as a reply's snippet, with mentions
	 * of known users and rooms shown as the Mention component, as in messages.
	 * They only read here: this sits inside controls (a reply quote jumps to
	 * its message), so nothing in it is itself clickable.
	 */
	let { text }: { text: string } = $props();

	let segments = $derived(mentionSegments(text, directory.resolve, directory.resolveRoom));
</script>

{#each segments as segment, index (index)}{#if typeof segment === 'string'}{segment}{:else}<span class={mentionClass(segment)} title={segment.target.kind === 'user' ? `@${segment.target.id}` : `#${segment.target.id}`}>{mentionLabel(segment)}</span>{/if}{/each}
