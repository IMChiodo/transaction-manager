import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeStore() {
	const getInitialTheme = (): Theme => {
		if (!browser) return 'light';

		const stored = localStorage.getItem('theme') as Theme | null;
		if (stored) return stored;

		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	};

	let theme = $state<Theme>(getInitialTheme());

	function applyTheme(newTheme: Theme) {
		if (!browser) return;
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(newTheme);
		localStorage.setItem('theme', newTheme);
	}

	if (browser) {
		applyTheme(theme);
	}

	function toggle() {
		theme = theme === 'light' ? 'dark' : 'light';
		applyTheme(theme);
	}

	function setTheme(newTheme: Theme) {
		theme = newTheme;
		applyTheme(theme);
	}

	return {
		get current() { return theme; },
		get isDark() { return theme === 'dark'; },
		toggle,
		setTheme
	};
}

export const themeStore = createThemeStore();
