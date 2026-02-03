<script lang="ts">
	import { formatCurrency, pluralize } from '$lib/utils/formatters';
	import { getCategoryColor } from '$lib/utils/colors';
	import Portal from '../ui/Portal.svelte';

	interface CategorySummary {
		category: string;
		total: number;
		count: number;
		percentage: number;
	}

	interface Props {
		categorySummaries: CategorySummary[];
		onClose: () => void;
	}

	let { categorySummaries, onClose }: Props = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
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
			<div class="relative w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in" style="max-height: calc(100vh - 2rem);">
				<div class="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between flex-shrink-0">
					<div>
						<h2 class="text-lg font-semibold text-[var(--text-primary)]">All Categories</h2>
						<p class="text-sm text-[var(--text-muted)]">
							{categorySummaries.length} {pluralize(categorySummaries.length, 'category', 'categories')}
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

				<div class="px-6 pt-4">
					<div class="h-3 rounded-full overflow-hidden flex bg-[var(--bg-tertiary)]">
						{#each categorySummaries as summary, index (summary.category)}
							{@const color = getCategoryColor(index)}
							{#if summary.percentage >= 0.5}
								<div
									class="{color.bg} h-full transition-all duration-500"
									style="width: {summary.percentage}%"
									title="{summary.category}: {formatCurrency(summary.total)} ({summary.percentage.toFixed(1)}%)"
								></div>
							{/if}
						{/each}
					</div>
				</div>

				<div class="flex-1 overflow-y-auto p-6 pt-4 min-h-0">
					<div class="space-y-2">
						{#each categorySummaries as summary, index (summary.category)}
							{@const color = getCategoryColor(index)}
							<div class="flex items-center gap-3 p-3 rounded-xl {color.light} ring-1 {color.ring}">
								<div class="w-2.5 h-2.5 rounded-full flex-shrink-0 {color.bg}"></div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center justify-between gap-2">
										<span class="text-sm font-medium text-[var(--text-primary)] truncate">{summary.category}</span>
										<span class="text-sm font-bold {color.text} whitespace-nowrap">
											{formatCurrency(summary.total)}
										</span>
									</div>
									<div class="flex items-center justify-between mt-0.5">
										<span class="text-xs text-[var(--text-muted)]">
											{summary.count} {pluralize(summary.count, 'transaction')}
										</span>
										<span class="text-xs font-medium {color.text}">
											{summary.percentage.toFixed(1)}%
										</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/30 flex-shrink-0">
					<button
						onclick={onClose}
						class="w-full py-2.5 bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-sm font-medium rounded-xl transition-all cursor-pointer"
					>
						Close
					</button>
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
