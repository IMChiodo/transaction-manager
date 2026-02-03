<script lang="ts">
	import Portal from '../ui/Portal.svelte';

	interface Props {
		pendingCount: number;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let { pendingCount, onConfirm, onCancel }: Props = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onCancel();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<Portal>
	<div class="fixed inset-0 z-[100] overflow-y-auto">
		<button
			class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm w-full h-full border-none cursor-default"
			onclick={onCancel}
			aria-label="Close modal"
		></button>

		<div class="relative z-[101] flex min-h-full items-center justify-center p-4">
			<div class="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
				<div class="px-6 py-4 border-b border-[var(--border-color)]">
					<h3 class="text-lg font-semibold text-[var(--text-primary)]">Accept All Suggestions</h3>
				</div>

				<div class="px-6 py-4">
					<p class="text-[var(--text-secondary)]">
						Are you sure you want to accept all <strong class="text-[var(--text-primary)]">{pendingCount}</strong> suggested categories?
					</p>
					<p class="text-sm text-[var(--text-muted)] mt-2">
						This will apply the auto-suggested category to each transaction.
					</p>
				</div>

				<div class="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/30 flex items-center justify-end gap-3">
					<button
						onclick={onCancel}
						class="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-xl transition-all cursor-pointer"
					>
						Cancel
					</button>
					<button
						onclick={onConfirm}
						class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
					>
						Accept All
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
