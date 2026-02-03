<script lang="ts">
	import { transactionStore } from '$lib/stores/transactionStore.svelte';
	import { toast } from '$lib/stores/toastStore.svelte';
	import { formatCurrency } from '$lib/utils/formatters';
	import Portal from '../ui/Portal.svelte';
	import type { Transaction } from '$lib/types/transaction';

	interface GroupData {
		name: string;
		transactions: Transaction[];
		totalAmount: number;
	}

	interface Props {
		groupsArray: GroupData[];
		similarGroups: Map<string, Transaction[]>;
		onClose: () => void;
		onCategorize?: () => void;
	}

	let { groupsArray, similarGroups, onClose, onCategorize }: Props = $props();

	let selectedGroup = $state<string | null>(null);
	let selectedCategory = $state('');

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}

	const selectedGroupData = $derived(selectedGroup ? similarGroups.get(selectedGroup) : null);

	function selectGroup(groupName: string) {
		selectedGroup = groupName;
		selectedCategory = '';
	}

	async function categorizeGroup() {
		if (!selectedGroup || !selectedCategory) return;

		const group = similarGroups.get(selectedGroup);
		if (!group) return;

		const ids = group.map((tx) => tx.id);
		const groupName = selectedGroup;
		const category = selectedCategory;
		const count = ids.length;

		try {
			await transactionStore.bulkCategorize(ids, category);
			toast.success(`Categorized ${count} transactions`, {
				description: `"${groupName}" → ${category}`
			});

			onCategorize?.();

			const currentIndex = groupsArray.findIndex((g) => g.name === groupName);
			if (currentIndex < groupsArray.length - 1) {
				selectedGroup = groupsArray[currentIndex + 1].name;
				selectedCategory = '';
			} else {
				onClose();
			}
		} catch (e) {
			toast.error('Failed to categorize', {
				description: e instanceof Error ? e.message : 'Unknown error'
			});
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<Portal>
	<div class="fixed inset-0 z-[100] overflow-y-auto">
		<button
			class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm w-full h-full border-none cursor-default"
			onclick={onClose}
			aria-label="Close modal"
		></button>

		<div class="relative z-[101] flex min-h-full items-center justify-center p-4">
			<div class="relative w-full max-w-4xl bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in" style="max-height: calc(100vh - 2rem);">
				<div class="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between flex-shrink-0">
					<div>
						<h2 class="text-lg font-semibold text-[var(--text-primary)]">Smart Bulk Categorize</h2>
						<p class="text-sm text-[var(--text-muted)]">
							Group similar transactions and categorize them together
						</p>
					</div>
					<button
						onclick={onClose}
						class="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all cursor-pointer"
						aria-label="Close modal"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div class="flex-1 overflow-hidden flex min-h-0">
					<div class="w-1/3 border-r border-[var(--border-color)] overflow-y-auto">
						<div class="p-2">
							{#each groupsArray as group}
								<button
									onclick={() => selectGroup(group.name)}
									class="w-full text-left p-3 rounded-xl mb-1 transition-all cursor-pointer
										{selectedGroup === group.name
										? 'bg-[var(--accent-primary)]/10 ring-1 ring-[var(--accent-primary)]/20'
										: 'hover:bg-[var(--bg-tertiary)]'}"
								>
									<div class="flex items-center justify-between">
										<span class="text-sm font-medium text-[var(--text-primary)] truncate">{group.name}</span>
										<span class="text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full">
											{group.transactions.length}
										</span>
									</div>
									<div class="text-xs text-[var(--text-muted)] mt-1">
										{formatCurrency(Math.abs(group.totalAmount))} total
									</div>
								</button>
							{/each}
						</div>
					</div>

					<div class="flex-1 overflow-y-auto p-4">
						{#if selectedGroupData}
							<div class="space-y-4">
								<div class="flex items-center justify-between">
									<h3 class="font-medium text-[var(--text-primary)]">
										{selectedGroupData.length} similar transactions
									</h3>
									<div class="flex items-center gap-2">
										<select
											bind:value={selectedCategory}
											class="text-sm border border-[var(--border-color)] rounded-lg px-3 py-1.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] cursor-pointer"
										>
											<option value="">Select category...</option>
											{#each transactionStore.allCategories as category}
												<option value={category}>{category}</option>
											{/each}
										</select>
										<button
											onclick={categorizeGroup}
											disabled={!selectedCategory}
											class="px-4 py-1.5 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
										>
											Apply to All
										</button>
									</div>
								</div>

								<div class="space-y-2">
									{#each selectedGroupData as tx}
										<div class="p-3 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-between">
											<div class="flex-1 min-w-0">
												<p class="text-sm text-[var(--text-primary)] truncate">{tx.description}</p>
												<p class="text-xs text-[var(--text-muted)]">{tx.date}</p>
											</div>
											<span class="text-sm font-medium ml-4 {tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}">
												{formatCurrency(tx.amount, true)}
											</span>
										</div>
									{/each}
								</div>
							</div>
						{:else}
							<div class="h-full flex items-center justify-center text-[var(--text-muted)]">
								<p>Select a group to view transactions</p>
							</div>
						{/if}
					</div>
				</div>

				<div class="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/30 flex-shrink-0">
					<p class="text-xs text-[var(--text-muted)]">
						Transactions are grouped by similar merchant names. Categorizing a group applies the category to all transactions in that group.
					</p>
				</div>
			</div>
		</div>
	</div>
</Portal>

<style>
	@keyframes scale-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	:global(.animate-scale-in) {
		animation: scale-in 0.2s ease-out;
	}
</style>
