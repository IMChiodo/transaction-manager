<script lang="ts">
	import { transactionStore } from '$lib/stores/transactionStore.svelte';

	interface Props {
		transactionId: string;
		currentCategory?: string;
		suggestedCategory?: string;
	}

	let { transactionId, currentCategory, suggestedCategory }: Props = $props();

	function handleCategoryChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const value = target.value;
		if (value) {
			transactionStore.setCategory(transactionId, value);
		}
	}

	const displayCategory = $derived(currentCategory || suggestedCategory || '');
	const isSuggested = $derived(!currentCategory && !!suggestedCategory);
</script>

<div class="relative">
	<select
		value={displayCategory}
		onchange={handleCategoryChange}
		class="block w-full text-xs border rounded-lg px-2 py-1 pr-6 appearance-none transition-all cursor-pointer
			{isSuggested
				? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20'
				: currentCategory
					? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20'
					: 'border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-muted)]'}"
	>
		<option value="" class="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
			{#if isSuggested}
				{suggestedCategory} (suggested)
			{:else if !currentCategory}
				Select category...
			{/if}
		</option>
		{#each transactionStore.allCategories as category}
			<option value={category} selected={category === currentCategory} class="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
				{category}
			</option>
		{/each}
	</select>

	<svg class="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none
		{isSuggested ? 'text-amber-500' : currentCategory ? 'text-emerald-500' : 'text-[var(--text-muted)]'}"
		fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
	</svg>

	{#if isSuggested}
		<span class="absolute -right-1 -top-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
	{/if}
</div>
