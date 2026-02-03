export function formatCurrency(amount: number, showSign = false): string {
	const formatted = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(Math.abs(amount));

	if (showSign) {
		return amount >= 0 ? `+${formatted}` : `-${formatted}`;
	}
	return formatted;
}

export function formatDate(
	dateStr: string,
	format: 'short' | 'medium' | 'long' = 'medium'
): string {
	const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
		short: { month: 'numeric', day: 'numeric' },
		medium: { year: 'numeric', month: 'short', day: 'numeric' },
		long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }
	};

	return new Date(dateStr).toLocaleDateString('en-US', optionsMap[format]);
}

export function formatPercentage(value: number, decimals = 1): string {
	return `${value.toFixed(decimals)}%`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
	return count === 1 ? singular : (plural ?? `${singular}s`);
}
