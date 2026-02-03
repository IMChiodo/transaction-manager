<script lang="ts">
	import { toastStore, toast } from '$lib/stores/toastStore.svelte';
	import Portal from './Portal.svelte';
</script>

<Portal>
	<div class="fixed bottom-4 right-4 z-[200] flex flex-col gap-2">
		{#each toastStore.toasts as t (t.id)}
			<div
				class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[280px] max-w-[400px] animate-slide-up
					{t.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/30' : ''}
					{t.type === 'error' ? 'bg-red-500 text-white shadow-red-500/30' : ''}
					{t.type === 'info' ? 'bg-blue-500 text-white shadow-blue-500/30' : ''}"
			>
				<!-- Icon -->
				{#if t.type === 'success'}
					<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else if t.type === 'error'}
					<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else}
					<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{/if}

				<!-- Content -->
				<div class="flex-1 min-w-0">
					<p class="font-medium">{t.title}</p>
					{#if t.description}
						<p class="text-sm opacity-90">{t.description}</p>
					{/if}
				</div>

				<!-- Dismiss -->
				<button
					onclick={() => toast.dismiss(t.id)}
					class="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
					aria-label="Dismiss"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/each}
	</div>
</Portal>

<style>
	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(1rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
</style>
