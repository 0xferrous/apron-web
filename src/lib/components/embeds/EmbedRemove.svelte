<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	/**
	 * The (x) on an embed's corner. Place it inside an `.embed-slot`: it shows
	 * while the slot is hovered or it has focus, and always on touch screens.
	 */
	let { label, onremove }: { label: string; onremove: () => void } = $props();
</script>

<button class="embed-remove" type="button" aria-label={label} title={label} onclick={onremove}>
	<X size={12} strokeWidth={2.5} aria-hidden="true" />
</button>

<style>
	.embed-remove {
		position: absolute; top: calc(-1 * var(--space-2)); right: calc(-1 * var(--space-2));
		display: grid; place-items: center; width: 22px; height: 22px; padding: 0;
		border: 1px solid var(--line-strong); border-radius: 50%;
		background: var(--bg-100); color: var(--ink-muted); cursor: pointer;
		opacity: 0; transition: opacity .12s;
	}
	:global(.embed-slot:hover) .embed-remove, .embed-remove:focus-visible { opacity: 1; }
	.embed-remove:hover { background: var(--bg-300); color: var(--ink); }
	@media (hover: none) { .embed-remove { opacity: 1; } }
</style>
