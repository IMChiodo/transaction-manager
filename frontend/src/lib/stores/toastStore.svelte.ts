export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
	id: string;
	type: ToastType;
	title: string;
	description?: string;
}

let toasts = $state<Toast[]>([]);

function generateId(): string {
	return Math.random().toString(36).substring(2, 9);
}

function addToast(type: ToastType, title: string, description?: string) {
	const id = generateId();
	toasts.push({ id, type, title, description });

	setTimeout(() => {
		dismiss(id);
	}, 3000);

	return id;
}

function dismiss(id: string) {
	toasts = toasts.filter((t) => t.id !== id);
}

export const toast = {
	success: (title: string, options?: { description?: string }) =>
		addToast('success', title, options?.description),
	error: (title: string, options?: { description?: string }) =>
		addToast('error', title, options?.description),
	info: (title: string, options?: { description?: string }) =>
		addToast('info', title, options?.description),
	dismiss
};

export const toastStore = {
	get toasts() {
		return toasts;
	}
};
