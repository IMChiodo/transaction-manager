<script lang="ts">
	import { transactionStore } from '$lib/stores/transactionStore.svelte';
	import { toast } from '$lib/stores/toastStore.svelte';
	import type { SortField, SortDirection } from '$lib/types/transaction';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import { createSelection } from '$lib/utils/selection.svelte';
	import CategoryDropdown from './CategoryDropdown.svelte';
	import SortableHeader from './ui/SortableHeader.svelte';
	import Pagination from './ui/Pagination.svelte';
	import EmptyState from './ui/EmptyState.svelte';
	import Tooltip from './ui/Tooltip.svelte';

	let currentPage = $state(1);
	let itemsPerPage = $state(10);

	let lastFilterConfig = $state(JSON.stringify(transactionStore.filterConfig));
	let lastSortConfig = $state(JSON.stringify(transactionStore.sortConfig));

	$effect(() => {
		const currentFilterConfig = JSON.stringify(transactionStore.filterConfig);
		const currentSortConfig = JSON.stringify(transactionStore.sortConfig);

		if (currentFilterConfig !== lastFilterConfig || currentSortConfig !== lastSortConfig) {
			currentPage = 1;
			lastFilterConfig = currentFilterConfig;
			lastSortConfig = currentSortConfig;
		}
	});

	async function handleAccept(transactionId: string) {
		const tx = transactionStore.transactions.find(t => t.id === transactionId);
		if (tx?.suggestedCategory) {
			await transactionStore.acceptSuggestion(transactionId);
			toast.success('Suggestion accepted', { description: `Category set to "${tx.suggestedCategory}"` });
		}
	}

	function handleReject(transactionId: string) {
		transactionStore.rejectSuggestion(transactionId);
		toast.info('Suggestion rejected');
	}

	const totalPages = $derived(Math.max(1, Math.ceil(transactionStore.sortedTransactions.length / itemsPerPage)));
	const validPage = $derived(Math.min(currentPage, totalPages));
	const startIndex = $derived((validPage - 1) * itemsPerPage);
	const endIndex = $derived(Math.min(startIndex + itemsPerPage, transactionStore.sortedTransactions.length));
	const paginatedTransactions = $derived(transactionStore.sortedTransactions.slice(startIndex, endIndex));

	const pageNumbers = $derived.by(() => {
		const pages: (number | '...')[] = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			pages.push(1);
			if (validPage > 3) pages.push('...');
			for (let i = Math.max(2, validPage - 1); i <= Math.min(totalPages - 1, validPage + 1); i++) {
				pages.push(i);
			}
			if (validPage < totalPages - 2) pages.push('...');
			pages.push(totalPages);
		}
		return pages;
	});

	const selection = createSelection(() => paginatedTransactions);
	let bulkCategory = $state('');

	async function handleBulkCategorize() {
		if (bulkCategory && selection.hasSelection) {
			await transactionStore.bulkCategorize(selection.getSelectedIds(), bulkCategory);
			selection.clear();
			bulkCategory = '';
		}
	}
	function getSortDirection(field: SortField): SortDirection | null {
		return transactionStore.sortConfig.field === field
			? transactionStore.sortConfig.direction
			: null;
	}

	function handleSort(field: SortField) {
		transactionStore.setSortConfig(field);
	}

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	}

	function setItemsPerPage(count: number) {
		itemsPerPage = count;
		currentPage = 1;
	}
</script>

<div class="card overflow-hidden">
	{#if selection.hasSelection}
		<div class="bg-[var(--accent-primary)]/10 px-4 py-3 border-b border-[var(--accent-primary)]/20 flex flex-wrap items-center gap-3 animate-fade-in">
			<span class="text-sm text-[var(--accent-primary)] font-semibold flex items-center gap-2">
				<span class="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white text-xs flex items-center justify-center font-bold">
					{selection.selectedCount}
				</span>
				selected
			</span>
			<select
				bind:value={bulkCategory}
				class="text-sm border border-[var(--accent-primary)]/30 rounded-lg px-3 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-primary)]"
			>
				<option value="">Select category...</option>
				{#each transactionStore.allCategories as category}
					<option value={category}>{category}</option>
				{/each}
			</select>
			<button
				onclick={handleBulkCategorize}
				disabled={!bulkCategory}
				class="text-sm bg-[var(--accent-primary)] text-white px-4 py-1.5 rounded-lg font-medium hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
			>
				Apply
			</button>
			<button
				onclick={() => selection.clear()}
				class="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
			>
				Clear
			</button>
		</div>
	{/if}

	<div class="hidden md:block overflow-x-auto">
		<table class="min-w-full">
			<thead class="bg-[var(--bg-tertiary)]/50">
				<tr>
					<th class="px-4 py-3 text-left w-12">
						<input
							type="checkbox"
							checked={selection.allVisibleSelected}
							indeterminate={selection.someVisibleSelected}
							onchange={() => selection.toggleAll()}
							class="rounded border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/50"
						/>
					</th>
					<SortableHeader
						label="Date"
						sortDirection={getSortDirection('date')}
						onclick={() => handleSort('date')}
					/>
					<SortableHeader
						label="Description"
						sortDirection={getSortDirection('description')}
						onclick={() => handleSort('description')}
					/>
					<SortableHeader
						label="Amount"
						sortDirection={getSortDirection('amount')}
						onclick={() => handleSort('amount')}
					/>
					<SortableHeader
						label="Category"
						sortDirection={getSortDirection('category')}
						onclick={() => handleSort('category')}
					/>
					<th class="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
						Actions
					</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-[var(--border-color)]">
				{#each paginatedTransactions as transaction (transaction.id)}
					<tr
						class="transition-colors hover:bg-[var(--bg-tertiary)]/50
							{selection.isSelected(transaction.id) ? 'bg-[var(--accent-primary)]/5' : ''}"
					>
						<td class="px-4 py-3">
							<input
								type="checkbox"
								checked={selection.isSelected(transaction.id)}
								onchange={() => selection.toggle(transaction.id)}
								class="rounded border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/50"
							/>
						</td>
						<td class="px-4 py-3 text-sm text-[var(--text-secondary)] whitespace-nowrap">
							{formatDate(transaction.date)}
						</td>
						<td class="px-4 py-3 text-sm text-[var(--text-primary)] max-w-xs truncate font-medium" title={transaction.description}>
							{transaction.description}
						</td>
						<td class="px-3 py-3 text-sm whitespace-nowrap font-semibold
							{transaction.amount > 0 ? 'text-emerald-500' : 'text-red-500'}"
						>
							{formatCurrency(transaction.amount, true)}
						</td>
						<td class="px-3 py-3 min-w-[150px]">
							<CategoryDropdown
								transactionId={transaction.id}
								currentCategory={transaction.category}
								suggestedCategory={transaction.suggestedCategory}
							/>
						</td>
						<td class="px-3 py-3 text-sm">
							{#if transaction.suggestedCategory && !transaction.category}
								<div class="flex gap-1">
									<Tooltip text="Accept">
										<button
											onclick={() => handleAccept(transaction.id)}
											class="w-7 h-7 flex items-center justify-center text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 ring-1 ring-emerald-500/20 transition-all cursor-pointer"
											aria-label="Accept"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
											</svg>
										</button>
									</Tooltip>
									<Tooltip text="Reject">
										<button
											onclick={() => handleReject(transaction.id)}
											class="w-7 h-7 flex items-center justify-center text-red-500 hover:text-red-600 bg-red-500/10 rounded-lg hover:bg-red-500/20 ring-1 ring-red-500/20 transition-all cursor-pointer"
											aria-label="Reject"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</Tooltip>
								</div>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="md:hidden divide-y divide-[var(--border-color)]">
		{#each paginatedTransactions as transaction (transaction.id)}
			<div
				class="p-4 transition-colors
					{selection.isSelected(transaction.id)
						? 'bg-[var(--accent-primary)]/5'
						: 'hover:bg-[var(--bg-tertiary)]/50'}"
			>
				<div class="flex items-start gap-3">
					<input
						type="checkbox"
						checked={selection.isSelected(transaction.id)}
						onchange={() => selection.toggle(transaction.id)}
						class="mt-1 rounded border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--accent-primary)]"
					/>
					<div class="flex-1 min-w-0">
						<div class="flex justify-between items-start gap-2">
							<p class="text-sm font-medium text-[var(--text-primary)] truncate">
								{transaction.description}
							</p>
							<span class="text-sm font-semibold whitespace-nowrap
								{transaction.amount > 0 ? 'text-emerald-500' : 'text-red-500'}"
							>
								{formatCurrency(transaction.amount, true)}
							</span>
						</div>
						<p class="text-xs text-[var(--text-muted)] mt-1">{formatDate(transaction.date)}</p>
						<div class="mt-2">
							<CategoryDropdown
								transactionId={transaction.id}
								currentCategory={transaction.category}
								suggestedCategory={transaction.suggestedCategory}
							/>
						</div>
						{#if transaction.suggestedCategory && !transaction.category}
							<div class="flex gap-1.5 mt-2">
								<Tooltip text="Accept suggestion">
									<button
										onclick={() => handleAccept(transaction.id)}
										class="w-7 h-7 flex items-center justify-center text-emerald-600 bg-emerald-500/10 rounded-lg ring-1 ring-emerald-500/20 cursor-pointer"
										aria-label="Accept suggestion"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
										</svg>
									</button>
								</Tooltip>
								<Tooltip text="Reject suggestion">
									<button
										onclick={() => handleReject(transaction.id)}
										class="w-7 h-7 flex items-center justify-center text-red-500 bg-red-500/10 rounded-lg ring-1 ring-red-500/20 cursor-pointer"
										aria-label="Reject suggestion"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</Tooltip>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>

	{#if transactionStore.sortedTransactions.length === 0}
		<EmptyState
			title="No transactions found"
			description="Try adjusting your filters"
		>
			{#snippet icon()}
				<svg class="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			{/snippet}
			{#snippet action()}
				<button
					onclick={() => transactionStore.clearAllFilters()}
					class="text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] transition-colors"
				>
					Clear all filters
				</button>
			{/snippet}
		</EmptyState>
	{/if}

	{#if transactionStore.sortedTransactions.length > 0}
		<Pagination
			currentPage={validPage}
			{totalPages}
			totalItems={transactionStore.sortedTransactions.length}
			{startIndex}
			{endIndex}
			{itemsPerPage}
			{pageNumbers}
			onPageChange={goToPage}
			onItemsPerPageChange={setItemsPerPage}
		/>
	{/if}
</div>
