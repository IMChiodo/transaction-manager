<script lang="ts">
	import { transactionStore } from '$lib/stores/transactionStore.svelte';

	let startDate = $state(transactionStore.filterConfig.dateRange?.start ?? '');
	let endDate = $state(transactionStore.filterConfig.dateRange?.end ?? '');
	let searchQuery = $state(transactionStore.filterConfig.searchQuery);
	let selectedCategories = $state<string[]>([...transactionStore.filterConfig.categories]);
	let showCategoryDropdown = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	const today = new Date().toISOString().split('T')[0];

	function handleDateFilter() {
		if (startDate && endDate) {
			transactionStore.setDateRange(startDate, endDate);
		}
	}

	function handleClearDateRange() {
		startDate = '';
		endDate = '';
		transactionStore.clearDateRange();
	}

	function handleSearchInput() {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}
		searchTimeout = setTimeout(() => {
			transactionStore.setSearchQuery(searchQuery);
		}, 300);
	}

	function toggleCategory(category: string) {
		if (selectedCategories.includes(category)) {
			selectedCategories = selectedCategories.filter(c => c !== category);
		} else {
			selectedCategories = [...selectedCategories, category];
		}
		transactionStore.setCategoryFilter(selectedCategories);
	}

	function clearCategoryFilter() {
		selectedCategories = [];
		transactionStore.setCategoryFilter([]);
	}

	function handleClearAll() {
		startDate = '';
		endDate = '';
		searchQuery = '';
		selectedCategories = [];
		transactionStore.clearAllFilters();
	}

	const hasActiveFilters = $derived(
		transactionStore.filterConfig.dateRange !== null ||
		transactionStore.filterConfig.categories.length > 0 ||
		transactionStore.filterConfig.searchQuery.trim() !== ''
	);

	const activeFilterCount = $derived(
		(transactionStore.filterConfig.dateRange !== null ? 1 : 0) +
		transactionStore.filterConfig.categories.length +
		(transactionStore.filterConfig.searchQuery.trim() !== '' ? 1 : 0)
	);
</script>

<div class="card px-4 py-3">
	<div class="flex flex-wrap items-center gap-3">
		<div class="relative flex-1 min-w-[200px] max-w-sm">
			<input
				type="text"
				bind:value={searchQuery}
				oninput={handleSearchInput}
				placeholder="Search transactions..."
				class="w-full pl-9 pr-8 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] transition-all"
			/>
			<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			{#if searchQuery}
				<button
					onclick={() => { searchQuery = ''; handleSearchInput(); }}
					aria-label="Clear search"
					class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-all"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			{/if}
		</div>

		<div class="flex items-center gap-2">
			<input
				type="date"
				bind:value={startDate}
				onchange={handleDateFilter}
				max={endDate || today}
				aria-label="Start date"
				class="px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] w-[140px] transition-all"
			/>
			<span class="text-[var(--text-muted)] text-sm">to</span>
			<input
				type="date"
				bind:value={endDate}
				onchange={handleDateFilter}
				min={startDate}
				max={today}
				aria-label="End date"
				class="px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] w-[140px] transition-all"
			/>
			{#if startDate || endDate}
				<button
					onclick={handleClearDateRange}
					class="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-all"
					title="Clear dates"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			{/if}
		</div>

		<div class="relative">
			<button
				onclick={() => showCategoryDropdown = !showCategoryDropdown}
				class="flex items-center gap-2 px-3 py-2 border rounded-xl text-sm font-medium transition-all
					{selectedCategories.length > 0
						? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/20'
						: 'border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)]'}"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
				</svg>
				Categories
				{#if selectedCategories.length > 0}
					<span class="bg-[var(--accent-primary)] text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
						{selectedCategories.length}
					</span>
				{/if}
				<svg class="w-4 h-4 transition-transform {showCategoryDropdown ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{#if showCategoryDropdown}
				<button
					class="fixed inset-0 z-10"
					onclick={() => showCategoryDropdown = false}
					aria-label="Close dropdown"
				></button>

				<div class="absolute top-full left-0 mt-2 w-64 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg z-20 max-h-72 overflow-hidden animate-fade-in">
					<div class="p-3 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-tertiary)]/50">
						<span class="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Filter by category</span>
						{#if selectedCategories.length > 0}
							<button
								onclick={clearCategoryFilter}
								class="text-xs font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] transition-colors"
							>
								Clear all
							</button>
						{/if}
					</div>
					<div class="p-2 space-y-0.5 overflow-y-auto max-h-56">
						{#each transactionStore.allCategories as category}
							<button
								onclick={() => toggleCategory(category)}
								class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-all
									{selectedCategories.includes(category)
										? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
										: 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}"
							>
								<span class="w-5 h-5 border-2 rounded-md flex items-center justify-center flex-shrink-0 transition-all
									{selectedCategories.includes(category)
										? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
										: 'border-[var(--border-color)]'}">
									{#if selectedCategories.includes(category)}
										<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
										</svg>
									{/if}
								</span>
								<span class="font-medium">{category}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		{#if hasActiveFilters}
			<button
				onclick={handleClearAll}
				class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-xl transition-all"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
				Clear
				<span class="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs px-1.5 py-0.5 rounded-full font-semibold">
					{activeFilterCount}
				</span>
			</button>
		{/if}
	</div>

	{#if selectedCategories.length > 0}
		<div class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--border-color)]">
			{#each selectedCategories as category}
				<span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium rounded-full ring-1 ring-[var(--accent-primary)]/20">
					{category}
					<button
						onclick={() => toggleCategory(category)}
						aria-label="Remove {category} filter"
						class="hover:bg-[var(--accent-primary)]/20 rounded-full p-0.5 transition-colors"
					>
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</span>
			{/each}
		</div>
	{/if}
</div>
