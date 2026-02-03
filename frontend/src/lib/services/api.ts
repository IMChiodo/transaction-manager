import type { Transaction } from '$lib/types/transaction';

const API_BASE = 'http://localhost:3000/api';

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

async function fetchApi<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	const response = await fetch(`${API_BASE}${endpoint}`, {
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		},
		...options
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Request failed' }));
		throw new ApiError(response.status, error.message || `HTTP ${response.status}`);
	}

	return response.json();
}


export const transactionApi = {
	async getAll(filters?: {
		startDate?: string;
		endDate?: string;
		category?: string;
		search?: string;
		sortBy?: 'date' | 'description' | 'amount' | 'category';
		sortDir?: 'asc' | 'desc';
	}): Promise<Transaction[]> {
		const params = new URLSearchParams();

		if (filters?.startDate) params.set('startDate', filters.startDate);
		if (filters?.endDate) params.set('endDate', filters.endDate);
		if (filters?.category) params.set('category', filters.category);
		if (filters?.search) params.set('search', filters.search);
		if (filters?.sortBy) params.set('sortBy', filters.sortBy);
		if (filters?.sortDir) params.set('sortDir', filters.sortDir);

		const query = params.toString();
		return fetchApi<Transaction[]>(`/transactions${query ? `?${query}` : ''}`);
	},

	async getById(id: string): Promise<Transaction> {
		return fetchApi<Transaction>(`/transactions/${id}`);
	},

	async updateCategory(id: string, category: string): Promise<Transaction> {
		return fetchApi<Transaction>(`/transactions/${id}`, {
			method: 'PATCH',
			body: JSON.stringify({ category })
		});
	},

	async bulkUpdateCategory(ids: string[], category: string): Promise<Transaction[]> {
		return fetchApi<Transaction[]>('/transactions/bulk', {
			method: 'POST',
			body: JSON.stringify({ ids, category })
		});
	},

	async importTransactions(
		transactions: { date: string; description: string; amount: number; category?: string }[]
	): Promise<{ imported: number; duplicates: number; total: number }> {
		return fetchApi('/transactions/import', {
			method: 'POST',
			body: JSON.stringify({ transactions })
		});
	},

	async importFromCsv(
		file: File
	): Promise<{ imported: number; duplicates: number; total: number; errors: string[] }> {
		const formData = new FormData();
		formData.append('file', file);

		const response = await fetch(`${API_BASE}/transactions/import/csv`, {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: 'Upload failed' }));
			throw new ApiError(response.status, error.message || `HTTP ${response.status}`);
		}

		return response.json();
	},

	async exportTransactions(filters?: {
		startDate?: string;
		endDate?: string;
		category?: string;
		search?: string;
	}): Promise<void> {
		const params = new URLSearchParams();

		if (filters?.startDate) params.set('startDate', filters.startDate);
		if (filters?.endDate) params.set('endDate', filters.endDate);
		if (filters?.category) params.set('category', filters.category);
		if (filters?.search) params.set('search', filters.search);

		const query = params.toString();
		const url = `${API_BASE}/transactions/export${query ? `?${query}` : ''}`;

		const response = await fetch(url);
		if (!response.ok) {
			throw new ApiError(response.status, 'Failed to export transactions');
		}

		const blob = await response.blob();
		const downloadUrl = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = downloadUrl;
		a.download = 'transactions.csv';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(downloadUrl);
	},

	async getSimilarGroups(): Promise<
		{ name: string; transactions: Transaction[]; totalAmount: number }[]
	> {
		return fetchApi('/transactions/groups/similar');
	}
};

export const categoryApi = {
	async getAll(): Promise<string[]> {
		return fetchApi<string[]>('/categories');
	},

	async getSuggestions(
		transactions: { id: string; description: string }[]
	): Promise<{ id: string; suggestedCategory: string | null }[]> {
		return fetchApi('/categories/suggest', {
			method: 'POST',
			body: JSON.stringify({ transactions })
		});
	}
};
