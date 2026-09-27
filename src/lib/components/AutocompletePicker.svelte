<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	interface Props<T> {
		/** The list's ID, which the field names in `aria-controls`; option `i` is `${id}-${i}`, its `aria-activedescendant`. */
		id: string;
		items: T[];
		active: number;
		label: string;
		testid: string;
		emptyText: string;
		getKey: (item: T) => string;
		onpick: (item: T) => void;
		onhover: (index: number) => void;
		row: Snippet<[T]>;
	}
	let { id, items, active, label, testid, emptyText, getKey, onpick, onhover, row }: Props<T> = $props();
	let listbox = $state<HTMLUListElement>();

	// Keep keyboard navigation visible when the suggestion list scrolls.
	$effect(() => {
		if (!items[active] || !listbox) return;
		const option = listbox.querySelectorAll<HTMLElement>('[role="option"]')[active];
		option?.scrollIntoView?.({ block: 'nearest' });
	});
</script>

{#if items.length === 0}
	<div class="ap-mpick" {id} role="listbox" aria-label={label} data-testid={testid}>
		<div class="ap-mpick-empty">{emptyText}</div>
	</div>
{:else}
	<ul class="ap-mpick" {id} role="listbox" aria-label={label} data-testid={testid} bind:this={listbox}>
		{#each items as item, index (getKey(item))}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<li
				id={`${id}-${index}`}
				role="option"
				aria-selected={index === active}
				class="ap-mpick-item"
				class:ap-mpick-active={index === active}
				onmousedown={(event) => { event.preventDefault(); onpick(item); }}
				onmouseenter={() => onhover(index)}
			>
				{@render row(item)}
				{#if index === active}<kbd class="ap-mpick-kbd">Tab</kbd>{/if}
			</li>
		{/each}
	</ul>
{/if}
