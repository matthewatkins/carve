import type { HTMLTag, Polymorphic } from "astro/types";

export type Theme = "system" | "light" | "dark";
export type EffectiveTheme = Exclude<Theme, "system">;
export type IconType = <T extends HTMLTag = "svg">(
	_props: Polymorphic<{ as: T }>,
) => unknown;

export interface ThemeState {
	preference: Theme;
	effective: EffectiveTheme;
}
