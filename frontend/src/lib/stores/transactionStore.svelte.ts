import type {
	Transaction,
	SortConfig,
	FilterConfig,
	CategorySummary,
	SortField,
	SortDirection
} from '$lib/types/transaction';
import { transactionApi, categoryApi } from '$lib/services/api';

function createTransactionStore() {
	let transactions = $state<Transaction[]>([]);
	let predefinedCategories = $state<string[]>([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	let sortConfig = $state<SortConfig>({ field: 'date', direction: 'desc' });
	let filterConfig = $state<FilterConfig>({
		dateRange: null,
		categories: [],
		searchQuery: ''
	});

	const sortedTransactions = $derived(transactions);

	const allCategories = $derived.by(() => {
		const categories = new Set<string>(predefinedCategories);

		transactions.forEach(tx => {
			if (tx.category) categories.add(tx.category);
			if (tx.suggestedCategory) categories.add(tx.suggestedCategory);
		});

		return Array.from(categories).sort();
	});

  	const categorySummaries = $derived.by(() => {
		const summaryMap = new Map<string, { total: number; count: number }>();
		let totalSpending = 0;

		transactions.forEach(tx => {
			if (tx.amount < 0) {
				const category = tx.category || tx.suggestedCategory || 'Uncategorized';
				const current = summaryMap.get(category) || { total: 0, count: 0 };
				const amount = Math.abs(tx.amount);

				summaryMap.set(category, {
					total: current.total + amount,
					count: current.count + 1
				});

				totalSpending += amount;
			}
		});

		const summaries: CategorySummary[] = Array.from(summaryMap.entries())
			.map(([category, data]) => ({
				category,
				total: data.total,
				count: data.count,
				percentage: totalSpending > 0 ? (data.total / totalSpending) * 100 : 0
			}))
			.sort((a, b) => b.total - a.total);

		return summaries;
	});

	const statistics = $derived.by(() => {
		const expenses = transactions.filter(tx => tx.amount < 0);
		const income = transactions.filter(tx => tx.amount > 0);

		const totalExpenses = expenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
		const totalIncome = income.reduce((sum, tx) => sum + tx.amount, 0);
		const averageTransaction = expenses.length > 0 ? totalExpenses / expenses.length : 0;

		return {
			totalTransactions: transactions.length,
			totalExpenses,
			totalIncome,
			netAmount: totalIncome - totalExpenses,
			averageTransaction,
			categorizedCount: transactions.filter(tx => tx.category).length,
			uncategorizedCount: transactions.filter(tx => !tx.category).length
		};
	});

	const pendingSuggestions = $derived(
		transactions.filter(tx => !tx.category && tx.suggestedCategory)
	);

	async function loadTransactions() {
		isLoading = true;
		error = null;

		try {
			const apiFilters: Parameters<typeof transactionApi.getAll>[0] = {
				sortBy: sortConfig.field,
				sortDir: sortConfig.direction
			};

			if (filterConfig.dateRange?.start) {
				apiFilters.startDate = filterConfig.dateRange.start;
			}
			if (filterConfig.dateRange?.end) {
				apiFilters.endDate = filterConfig.dateRange.end;
			}
			if (filterConfig.categories.length > 0) {
				apiFilters.category = filterConfig.categories.join(',');
			}
			if (filterConfig.searchQuery.trim()) {
				apiFilters.search = filterConfig.searchQuery;
			}

			const [txData, categories] = await Promise.all([
				transactionApi.getAll(apiFilters),
				categoryApi.getAll()
			]);

			const uncategorized = txData.filter(tx => !tx.category);
			let suggestions: { id: string; suggestedCategory: string | null }[] = [];

			if (uncategorized.length > 0) {
				suggestions = await categoryApi.getSuggestions(
					uncategorized.map(tx => ({ id: tx.id, description: tx.description }))
				);
			}

			const suggestionMap = new Map(suggestions.map(s => [s.id, s.suggestedCategory]));
			transactions = txData.map(tx => ({
				...tx,
				suggestedCategory: tx.category ? undefined : suggestionMap.get(tx.id) ?? undefined
			}));

			predefinedCategories = categories;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load transactions';
			console.error('Failed to load transactions:', e);
		} finally {
			isLoading = false;
		}
	}

	async function setCategory(transactionId: string, category: string) {
		try {
			const updated = await transactionApi.updateCategory(transactionId, category);
			transactions = transactions.map(tx =>
				tx.id === transactionId
					? { ...updated, suggestedCategory: undefined }
					: tx
			);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to update category';
			console.error('Failed to update category:', e);
		}
	}

	async function acceptSuggestion(transactionId: string) {
		const tx = transactions.find(t => t.id === transactionId);
		if (tx?.suggestedCategory) {
			await setCategory(transactionId, tx.suggestedCategory);
		}
	}

	function rejectSuggestion(transactionId: string) {
		transactions = transactions.map(tx =>
			tx.id === transactionId
				? { ...tx, suggestedCategory: undefined }
				: tx
		);
	}

	async function bulkCategorize(transactionIds: string[], category: string) {
		try {
			const updated = await transactionApi.bulkUpdateCategory(transactionIds, category);
			const updatedMap = new Map(updated.map(tx => [tx.id, tx]));

			transactions = transactions.map(tx =>
				updatedMap.has(tx.id)
					? { ...updatedMap.get(tx.id)!, suggestedCategory: undefined }
					: tx
			);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to bulk update categories';
			console.error('Failed to bulk update:', e);
		}
	}

	async function acceptAllSuggestions() {
		const pending = transactions.filter(tx => !tx.category && tx.suggestedCategory);
		if (pending.length === 0) return;

		const byCategory = new Map<string, string[]>();
		pending.forEach(tx => {
			const cat = tx.suggestedCategory!;
			const ids = byCategory.get(cat) || [];
			ids.push(tx.id);
			byCategory.set(cat, ids);
		});

		try {
			for (const [category, ids] of byCategory) {
				await bulkCategorize(ids, category);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to accept all suggestions';
		}
	}

	async function setSortConfig(field: SortField, direction?: SortDirection) {
		if (direction) {
			sortConfig = { field, direction };
		} else {
			if (sortConfig.field === field) {
				sortConfig = { field, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' };
			} else {
				sortConfig = { field, direction: 'desc' };
			}
		}
		await loadTransactions();
	}

	async function setDateRange(start: string, end: string) {
		filterConfig = { ...filterConfig, dateRange: { start, end } };
		await loadTransactions();
	}

	async function clearDateRange() {
		filterConfig = { ...filterConfig, dateRange: null };
		await loadTransactions();
	}

	async function setCategoryFilter(categories: string[]) {
		filterConfig = { ...filterConfig, categories };
		await loadTransactions();
	}

	async function setSearchQuery(query: string) {
		filterConfig = { ...filterConfig, searchQuery: query };
		await loadTransactions();
	}

	async function clearAllFilters() {
		filterConfig = {
			dateRange: null,
			categories: [],
			searchQuery: ''
		};
		await loadTransactions();
	}

	function clearError() {
		error = null;
	}

	return {
		get transactions() { return transactions; },
		get sortConfig() { return sortConfig; },
		get filterConfig() { return filterConfig; },
		get isLoading() { return isLoading; },
		get error() { return error; },

		get sortedTransactions() { return sortedTransactions; },
		get allCategories() { return allCategories; },
		get categorySummaries() { return categorySummaries; },
		get statistics() { return statistics; },
		get pendingSuggestions() { return pendingSuggestions; },

		loadTransactions,
		setCategory,
		acceptSuggestion,
		rejectSuggestion,
		bulkCategorize,
		acceptAllSuggestions,
		setSortConfig,
		setDateRange,
		clearDateRange,
		setCategoryFilter,
		setSearchQuery,
		clearAllFilters,
		clearError
	};
}

export const transactionStore = createTransactionStore();
