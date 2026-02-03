<script lang="ts">
	interface Props {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		startIndex: number;
		endIndex: number;
		itemsPerPage: number;
		pageNumbers: (number | '...')[];
		onPageChange: (page: number) => void;
		onItemsPerPageChange: (count: number) => void;
		itemsPerPageOptions?: number[];
	}

	let {
		currentPage,
		totalPages,
		totalItems,
		startIndex,
		endIndex,
		itemsPerPage,
		pageNumbers,
		onPageChange,
		onItemsPerPageChange,
		itemsPerPageOptions = [10, 25, 50]
	}: Props = $props();
</script>

<div class="px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
	<div class="flex items-center gap-2 text-sm text-[var(--text-muted)]">
		<span>Show</span>
		<select
			value={itemsPerPage}
			onchange={(e) => onItemsPerPageChange(Number((e.target as HTMLSelectElement).value))}
			class="border border-[var(--border-color)] rounded-lg px-2 py-1 bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm"
		>
			{#each itemsPerPageOptions as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
		<span>of <span class="font-medium text-[var(--text-primary)]">{totalItems}</span></span>
	</div>

	<div class="flex items-center gap-1">
		<button
			onclick={() => onPageChange(currentPage - 1)}
			disabled={currentPage === 1}
			aria-label="Previous page"
			class="px-3 py-1.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--border-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		{#each pageNumbers as page}
			{#if page === '...'}
				<span class="px-2 py-1.5 text-sm text-[var(--text-muted)]">...</span>
			{:else}
				<button
					onclick={() => onPageChange(page)}
					class="px-3 py-1.5 text-sm border rounded-lg font-medium transition-all
						{currentPage === page
							? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
							: 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--border-hover)]'}"
				>
					{page}
				</button>
			{/if}
		{/each}

		<button
			onclick={() => onPageChange(currentPage + 1)}
			disabled={currentPage === totalPages}
			aria-label="Next page"
			class="px-3 py-1.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--border-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</button>
	</div>

	<div class="text-sm text-[var(--text-muted)]">
		<span class="font-medium text-[var(--text-primary)]">{startIndex + 1}-{endIndex}</span> of {totalItems}
	</div>
</div>
