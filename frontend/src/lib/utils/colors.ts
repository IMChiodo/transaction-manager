export interface CategoryColor {
	bg: string;
	light: string;
	text: string;
	ring: string;
}

export const categoryColors: CategoryColor[] = [
	{ bg: 'bg-blue-500', light: 'bg-blue-500/10', text: 'text-blue-500', ring: 'ring-blue-500/20' },
	{ bg: 'bg-emerald-500', light: 'bg-emerald-500/10', text: 'text-emerald-500', ring: 'ring-emerald-500/20' },
	{ bg: 'bg-amber-500', light: 'bg-amber-500/10', text: 'text-amber-500', ring: 'ring-amber-500/20' },
	{ bg: 'bg-purple-500', light: 'bg-purple-500/10', text: 'text-purple-500', ring: 'ring-purple-500/20' },
	{ bg: 'bg-rose-500', light: 'bg-rose-500/10', text: 'text-rose-500', ring: 'ring-rose-500/20' },
	{ bg: 'bg-indigo-500', light: 'bg-indigo-500/10', text: 'text-indigo-500', ring: 'ring-indigo-500/20' },
	{ bg: 'bg-orange-500', light: 'bg-orange-500/10', text: 'text-orange-500', ring: 'ring-orange-500/20' },
	{ bg: 'bg-teal-500', light: 'bg-teal-500/10', text: 'text-teal-500', ring: 'ring-teal-500/20' },
	{ bg: 'bg-cyan-500', light: 'bg-cyan-500/10', text: 'text-cyan-500', ring: 'ring-cyan-500/20' },
	{ bg: 'bg-pink-500', light: 'bg-pink-500/10', text: 'text-pink-500', ring: 'ring-pink-500/20' },
];

export function getCategoryColor(index: number): CategoryColor {
	return categoryColors[index % categoryColors.length];
}
