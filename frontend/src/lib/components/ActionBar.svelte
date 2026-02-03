<script lang="ts">
	import { transactionStore } from '$lib/stores/transactionStore.svelte';
	import { transactionApi } from '$lib/services/api';
	import { toast } from '$lib/stores/toastStore.svelte';
	import type { Transaction } from '$lib/types/transaction';

	import Tooltip from './ui/Tooltip.svelte';
	import AcceptAllModal from './modals/AcceptAllModal.svelte';
	import SmartCategorizeModal from './modals/SmartCategorizeModal.svelte';

	interface TransactionGroup {
		name: string;
		transactions: Transaction[];
		totalAmount: number;
	}

	interface Props {
		filters?: {
			startDate?: string;
			endDate?: string;
			category?: string;
			search?: string;
		};
	}

	let { filters }: Props = $props();

	let fileInput: HTMLInputElement;

	let importing = $state(false);
	let exporting = $state(false);

	let showAcceptAllModal = $state(false);
	let showSmartModal = $state(false);

	let groupsArray = $state<TransactionGroup[]>([]);

	async function loadSimilarGroups() {
		try {
			groupsArray = await transactionApi.getSimilarGroups();
		} catch {
			groupsArray = [];
		}
	}

	$effect(() => {
		transactionStore.transactions;
		loadSimilarGroups();
	});

	const similarGroups = $derived(
		new Map(groupsArray.map((g) => [g.name, g.transactions]))
	);

	const hasGroups = $derived(groupsArray.length > 0);
	const hasPendingSuggestions = $derived(transactionStore.pendingSuggestions.length > 0);

	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		importing = true;

		try {
			const result = await transactionApi.importFromCsv(file);
			if (fileInput) fileInput.value = '';
			await transactionStore.loadTransactions();

			let description = `${result.imported} imported`;
			if (result.duplicates > 0) {
				description += `, ${result.duplicates} duplicates skipped`;
			}
			if (result.errors.length > 0) {
				description += `, ${result.errors.length} rows had errors`;
			}

			toast.success('Import successful', { description });
			await loadSimilarGroups();
		} catch (e) {
			toast.error('Import failed', {
				description: e instanceof Error ? e.message : 'Unknown error'
			});
		} finally {
			importing = false;
			if (fileInput) fileInput.value = '';
		}
	}

	async function handleExport() {
		exporting = true;

		try {
			await transactionApi.exportTransactions(filters);
			toast.success('Export complete', { description: 'CSV file downloaded' });
		} catch (e) {
			toast.error('Export failed', {
				description: e instanceof Error ? e.message : 'Unknown error'
			});
		} finally {
			exporting = false;
		}
	}

	async function handleAcceptAll() {
		await transactionStore.acceptAllSuggestions();
		showAcceptAllModal = false;
		toast.success('All suggestions accepted');
		await loadSimilarGroups();
	}
</script>

<input bind:this={fileInput} type="file" accept=".csv" onchange={handleFileSelect} class="hidden" />

<div class="flex items-center gap-2">
	{#if hasPendingSuggestions}
		<button
			onclick={() => (showAcceptAllModal = true)}
			class="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
		>
			<span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
			Accept All ({transactionStore.pendingSuggestions.length})
		</button>
	{/if}

	{#if hasGroups}
		<button
			onclick={() => (showSmartModal = true)}
			class="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-all cursor-pointer"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
				/>
			</svg>
			Smart Categorize ({groupsArray.length})
		</button>
	{/if}

	{#if hasPendingSuggestions || hasGroups}
		<div class="w-px h-6 bg-[var(--border-color)]"></div>
	{/if}

	<Tooltip text="Import from CSV" position="bottom">
		<button
			onclick={() => fileInput?.click()}
			disabled={importing}
			class="flex items-center gap-2 px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
			aria-label="Import CSV"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
				/>
			</svg>
			<span class="hidden sm:inline">{importing ? 'Importing...' : 'Import'}</span>
		</button>
	</Tooltip>

	<Tooltip text="Export to CSV" position="bottom">
		<button
			onclick={handleExport}
			disabled={exporting}
			class="flex items-center gap-2 px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
			aria-label="Export CSV"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
				/>
			</svg>
			<span class="hidden sm:inline">{exporting ? 'Exporting...' : 'Export'}</span>
		</button>
	</Tooltip>
</div>

{#if showAcceptAllModal}
	<AcceptAllModal
		pendingCount={transactionStore.pendingSuggestions.length}
		onConfirm={handleAcceptAll}
		onCancel={() => (showAcceptAllModal = false)}
	/>
{/if}

{#if showSmartModal}
	<SmartCategorizeModal
		{groupsArray}
		{similarGroups}
		onClose={() => (showSmartModal = false)}
		onCategorize={loadSimilarGroups}
	/>
{/if}

<style>
	.hidden {
		display: none;
	}
</style>
