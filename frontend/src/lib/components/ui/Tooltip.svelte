<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		children: Snippet;
		position?: 'top' | 'bottom' | 'left' | 'right';
	}

	let { text, children, position = 'top' }: Props = $props();

	const positionClasses = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2'
	};
</script>

<div class="relative inline-flex group">
	{@render children()}
	<div class="absolute {positionClasses[position]} px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none z-50 shadow-lg">
		{text}
	</div>
</div>
