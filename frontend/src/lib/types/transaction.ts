export interface Transaction {
	id: string;
	date: string;
	description: string;
	amount: number;
	category?: string;
	suggestedCategory?: string;
}

export interface CategoryRule {
	pattern: string;
	category: string;
}

export interface CategorySummary {
	category: string;
	total: number;
	count: number;
	percentage: number;
}

export type SortField = 'date' | 'amount' | 'category' | 'description';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
	field: SortField;
	direction: SortDirection;
}

export interface DateRange {
	start: string;
	end: string;
}

export interface FilterConfig {
	dateRange: DateRange | null;
	categories: string[];
	searchQuery: string;
}
