
export interface Selectable {
	id: string;
}

export function createSelection<T extends Selectable>(
	getVisibleItems: () => T[]
) {
	let selected = $state<Set<string>>(new Set());

	const visibleItems = $derived(getVisibleItems());
	const selectedCount = $derived(selected.size);
	const hasSelection = $derived(selected.size > 0);

	const allVisibleSelected = $derived(
		visibleItems.length > 0 &&
		visibleItems.every(item => selected.has(item.id))
	);

	const someVisibleSelected = $derived(
		visibleItems.some(item => selected.has(item.id)) && !allVisibleSelected
	);

	function toggle(id: string) {
		const newSet = new Set(selected);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		selected = newSet;
	}

	function select(id: string) {
		if (!selected.has(id)) {
			selected = new Set([...selected, id]);
		}
	}

	function deselect(id: string) {
		if (selected.has(id)) {
			const newSet = new Set(selected);
			newSet.delete(id);
			selected = newSet;
		}
	}

	function toggleAll() {
		if (allVisibleSelected) {
			const visibleIds = new Set(visibleItems.map(item => item.id));
			selected = new Set([...selected].filter(id => !visibleIds.has(id)));
		} else {
			const newSet = new Set(selected);
			visibleItems.forEach(item => newSet.add(item.id));
			selected = newSet;
		}
	}

	function selectMultiple(ids: string[]) {
		selected = new Set([...selected, ...ids]);
	}

	function clear() {
		selected = new Set();
	}

	function isSelected(id: string): boolean {
		return selected.has(id);
	}

	function getSelectedIds(): string[] {
		return Array.from(selected);
	}

	function getSelectedItems(allItems: T[]): T[] {
		return allItems.filter(item => selected.has(item.id));
	}

	return {
		get selected() { return selected; },
		get selectedCount() { return selectedCount; },
		get hasSelection() { return hasSelection; },
		get allVisibleSelected() { return allVisibleSelected; },
		get someVisibleSelected() { return someVisibleSelected; },

		toggle,
		select,
		deselect,
		toggleAll,
		selectMultiple,
		clear,
		isSelected,
		getSelectedIds,
		getSelectedItems
	};
}
