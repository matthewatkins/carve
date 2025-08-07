import type { HTMLTag, Polymorphic } from "astro/types";

type IconType = <T extends HTMLTag = "svg">(
	_props: Polymorphic<{ as: T }>,
) => unknown;

export interface Network {
	name: string;
	link: string;
	icon: IconType | undefined;
	isVisible: boolean;
}
