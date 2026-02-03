<script lang="ts">
	import { onMount } from 'svelte';
	import { transactionStore } from '$lib/stores/transactionStore.svelte';
	import TransactionTable from '$lib/components/TransactionTable.svelte';
	import FilterPanel from '$lib/components/FilterPanel.svelte';
	import CategoryAnalytics from '$lib/components/CategoryAnalytics.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import ActionBar from '$lib/components/ActionBar.svelte';

	const exportFilters = $derived.by(() => {
		const filters: {
			startDate?: string;
			endDate?: string;
			category?: string;
			search?: string;
		} = {};

		if (transactionStore.filterConfig.dateRange?.start) {
			filters.startDate = transactionStore.filterConfig.dateRange.start;
		}
		if (transactionStore.filterConfig.dateRange?.end) {
			filters.endDate = transactionStore.filterConfig.dateRange.end;
		}
		if (transactionStore.filterConfig.categories.length > 0) {
			filters.category = transactionStore.filterConfig.categories.join(',');
		}
		if (transactionStore.filterConfig.searchQuery) {
			filters.search = transactionStore.filterConfig.searchQuery;
		}

		return filters;
	});

	const hasActiveFilters = $derived(
		transactionStore.filterConfig.dateRange !== null ||
		transactionStore.filterConfig.categories.length > 0 ||
		transactionStore.filterConfig.searchQuery.trim() !== ''
	);

	onMount(() => {
		transactionStore.loadTransactions();
	});
</script>

<div class="min-h-screen bg-[var(--bg-primary)] transition-colors duration-200">
	<header class="sticky top-0 z-30 bg-[var(--bg-secondary)]/80 backdrop-blur-lg border-b border-[var(--border-color)]">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
						<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
						</svg>
					</div>
					<div>
						<h1 class="text-xl font-bold text-[var(--text-primary)]">Transaction Manager</h1>
						<p class="text-sm text-[var(--text-muted)]">
							{transactionStore.statistics.totalTransactions} transactions
						</p>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<ActionBar filters={exportFilters} />
					<div class="w-px h-6 bg-[var(--border-color)]"></div>
					<ThemeToggle />
				</div>
			</div>
		</div>
	</header>

	{#if transactionStore.error}
		<div class="bg-red-500/10 border-b border-red-500/20 animate-fade-in">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
						<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<span class="text-sm text-red-500 font-medium">{transactionStore.error}</span>
				</div>
				<button
					onclick={() => transactionStore.clearError()}
					class="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
					aria-label="Dismiss error"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	{/if}

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
		{#if transactionStore.isLoading}
			<div class="flex flex-col items-center justify-center py-32">
				<div class="relative">
					<div class="w-16 h-16 rounded-full border-4 border-[var(--bg-tertiary)]"></div>
					<div class="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[var(--accent-primary)] animate-spin"></div>
				</div>
				<p class="mt-6 text-[var(--text-secondary)] font-medium">Loading transactions...</p>
				<p class="mt-1 text-sm text-[var(--text-muted)]">Fetching data from server</p>
			</div>
		{:else if transactionStore.transactions.length === 0 && !transactionStore.error && !hasActiveFilters}
			<div class="flex flex-col items-center justify-center py-32 text-center">
				<div class="w-20 h-20 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-6">
					<svg class="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
					</svg>
				</div>
				<h2 class="text-xl font-semibold text-[var(--text-primary)] mb-2">No transactions found</h2>
				<p class="text-[var(--text-muted)] mb-6 max-w-sm">
					Make sure the backend server is running on port 3000
				</p>
				<button
					onclick={() => transactionStore.loadTransactions()}
					class="px-5 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
				>
					Try Again
				</button>
			</div>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
				<div class="lg:col-span-1 space-y-6">
					<CategoryAnalytics />
				</div>

				<div class="lg:col-span-2 space-y-4">
					<FilterPanel />
					<TransactionTable />
				</div>
			</div>
		{/if}
	</main>

</div>
