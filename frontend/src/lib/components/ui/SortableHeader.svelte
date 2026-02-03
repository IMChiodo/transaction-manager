<script lang="ts">
	import type { SortDirection } from '$lib/types/transaction';

	interface Props {
		label: string;
		sortDirection: SortDirection | null;
		onclick: () => void;
	}

	let { label, sortDirection, onclick }: Props = $props();
</script>

<th
	{onclick}
	class="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors group"
>
	<span class="flex items-center gap-1.5">
		{label}
		{#if sortDirection === 'asc'}
			<svg class="w-4 h-4 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
			</svg>
		{:else if sortDirection === 'desc'}
			<svg class="w-4 h-4 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		{:else}
			<svg class="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
			</svg>
		{/if}
	</span>
</th>
