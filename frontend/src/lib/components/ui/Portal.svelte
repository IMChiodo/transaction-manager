<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let wrapper: HTMLDivElement;
	let portal: HTMLDivElement;

	onMount(() => {
		portal = document.createElement('div');
		portal.className = 'portal';
		document.body.appendChild(portal);

		while (wrapper.firstChild) {
			portal.appendChild(wrapper.firstChild);
		}

		const observer = new MutationObserver(() => {
			while (wrapper.firstChild) {
				portal.appendChild(wrapper.firstChild);
			}
		});

		observer.observe(wrapper, { childList: true });

		return () => {
			observer.disconnect();
			portal.remove();
		};
	});
</script>

<div bind:this={wrapper} class="hidden">
	{@render children()}
</div>
