import type { EffectiveTheme, Theme } from "./types";

const STORAGE_KEY = "theme";

export function getSystemTheme(): EffectiveTheme {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export function getStoredTheme(): Theme {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return isValidTheme(stored) ? stored : "dark";
	} catch {
		return "dark";
	}
}

export function setStoredTheme(theme: Theme): void {
	try {
		localStorage.setItem(STORAGE_KEY, theme);
	} catch (e) {
		console.warn("Failed to save theme preference:", e);
	}
}

function isValidTheme(value: unknown): value is Theme {
	return (
		typeof value === "string" && ["system", "light", "dark"].includes(value)
	);
}

export function getEffectiveTheme(preference: Theme): EffectiveTheme {
	return preference === "system" ? getSystemTheme() : preference;
}
