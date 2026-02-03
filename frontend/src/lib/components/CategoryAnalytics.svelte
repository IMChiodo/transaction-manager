<script lang="ts">
	import { transactionStore } from '$lib/stores/transactionStore.svelte';
	import { formatCurrency, pluralize } from '$lib/utils/formatters';
	import { getCategoryColor } from '$lib/utils/colors';
	import CategoryDetailsModal from './modals/CategoryDetailsModal.svelte';

	let showCategoryModal = $state(false);
	const visibleCategories = $derived(transactionStore.categorySummaries.slice(0, 5));
	const hasMoreCategories = $derived(transactionStore.categorySummaries.length > 5);
</script>

<div class="card p-5 space-y-6">
	<div>
		<h2 class="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
			<svg class="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
			</svg>
			Summary
		</h2>

		<div class="grid grid-cols-2 gap-3">
			<div class="p-4 rounded-xl bg-[var(--bg-tertiary)] group hover:scale-[1.02] transition-transform">
				<p class="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Transactions</p>
				<p class="text-2xl font-bold text-[var(--text-primary)]">{transactionStore.statistics.totalTransactions}</p>
			</div>

			<div class="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 ring-1 ring-red-500/20 group hover:scale-[1.02] transition-transform">
				<p class="text-xs font-medium text-red-500 uppercase tracking-wider mb-1">Total Spent</p>
				<p class="text-lg font-bold text-red-500 truncate">{formatCurrency(transactionStore.statistics.totalExpenses)}</p>
			</div>

			<div class="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 ring-1 ring-emerald-500/20 group hover:scale-[1.02] transition-transform">
				<p class="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-1">Total Income</p>
				<p class="text-lg font-bold text-emerald-500 truncate">{formatCurrency(transactionStore.statistics.totalIncome)}</p>
			</div>

			<div class="p-4 rounded-xl ring-1 group hover:scale-[1.02] transition-transform
				{transactionStore.statistics.netAmount >= 0
					? 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 ring-emerald-500/20'
					: 'bg-gradient-to-br from-red-500/10 to-red-500/5 ring-red-500/20'}">
				<p class="text-xs font-medium uppercase tracking-wider mb-1
					{transactionStore.statistics.netAmount >= 0 ? 'text-emerald-500' : 'text-red-500'}">
					Net
				</p>
				<p class="text-lg font-bold truncate
					{transactionStore.statistics.netAmount >= 0 ? 'text-emerald-500' : 'text-red-500'}">
					{formatCurrency(transactionStore.statistics.netAmount)}
				</p>
			</div>
		</div>

		<div class="grid grid-cols-3 gap-2 mt-3">
			<div class="p-3 rounded-lg bg-[var(--bg-tertiary)] text-center">
				<p class="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Avg Txn</p>
				<p class="text-sm font-semibold text-[var(--text-primary)] truncate">
					{formatCurrency(transactionStore.statistics.averageTransaction)}
				</p>
			</div>
			<div class="p-3 rounded-lg bg-[var(--accent-primary)]/10 text-center ring-1 ring-[var(--accent-primary)]/20">
				<p class="text-[10px] font-medium text-[var(--accent-primary)] uppercase tracking-wider mb-0.5">Categorized</p>
				<p class="text-sm font-semibold text-[var(--accent-primary)]">
					{transactionStore.statistics.categorizedCount}
				</p>
			</div>
			<div class="p-3 rounded-lg bg-amber-500/10 text-center ring-1 ring-amber-500/20">
				<p class="text-[10px] font-medium text-amber-500 uppercase tracking-wider mb-0.5">Pending</p>
				<p class="text-sm font-semibold text-amber-500">
					{transactionStore.statistics.uncategorizedCount}
				</p>
			</div>
		</div>
	</div>

	<div>
		<h2 class="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
			<svg class="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
			</svg>
			Spending by Category
		</h2>

		{#if transactionStore.categorySummaries.length === 0}
			<div class="text-center py-8">
				<div class="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-3">
					<svg class="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
				<p class="text-sm text-[var(--text-muted)]">No expense data to display</p>
			</div>
		{:else}
			<div class="mb-4">
				<div class="h-3 rounded-full overflow-hidden flex bg-[var(--bg-tertiary)]">
					{#each transactionStore.categorySummaries as summary, index (summary.category)}
						{@const color = getCategoryColor(index)}
						{#if summary.percentage >= 0.5}
							<div
								class="{color.bg} h-full transition-all duration-500 hover:opacity-80 cursor-pointer relative group first:rounded-l-full last:rounded-r-full"
								style="width: {summary.percentage}%"
								title="{summary.category}: {formatCurrency(summary.total)} ({summary.percentage.toFixed(1)}%)"
							>
								<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
									<span class="font-medium">{summary.category}</span>: {formatCurrency(summary.total)}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				{#each visibleCategories as summary, index (summary.category)}
					{@const color = getCategoryColor(index)}
					<div class="flex items-center gap-3 p-3 rounded-xl {color.light} ring-1 {color.ring} hover:scale-[1.01] transition-all cursor-default">
						<div class="w-2.5 h-2.5 rounded-full flex-shrink-0 {color.bg}"></div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between gap-2">
								<span class="text-sm font-medium text-[var(--text-primary)] truncate">{summary.category}</span>
								<span class="text-sm font-bold {color.text} whitespace-nowrap">
									{formatCurrency(summary.total)}
								</span>
							</div>
							<div class="flex items-center justify-between mt-0.5">
								<span class="text-xs text-[var(--text-muted)]">
									{summary.count} {pluralize(summary.count, 'transaction')}
								</span>
								<span class="text-xs font-medium {color.text}">
									{summary.percentage.toFixed(1)}%
								</span>
							</div>
						</div>
					</div>
				{/each}
			</div>

			{#if hasMoreCategories}
				<button
					onclick={() => showCategoryModal = true}
					class="w-full mt-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-xl transition-all cursor-pointer"
				>
					View all {transactionStore.categorySummaries.length} categories
				</button>
			{/if}
		{/if}
	</div>
</div>

{#if showCategoryModal}
	<CategoryDetailsModal
		categorySummaries={transactionStore.categorySummaries}
		onClose={() => showCategoryModal = false}
	/>
{/if}
