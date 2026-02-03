<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import Toaster from '$lib/components/ui/Toaster.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Transaction Manager</title>
</svelte:head>

<Toaster />

{@render children()}
