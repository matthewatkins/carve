import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: "https://carve.atkins.codes",
	vite: {
		plugins: [tailwindcss()],
		preview: {
			host: true,
		},
	},
	integrations: [
		starlight({
			title: "Carve",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/matthewatkins/carve",
				},
			],
			sidebar: [
				{
					label: "Guides",
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: "Example Guide", slug: "guides/example" },
					],
				},
				{
					label: "Reference",
					autogenerate: { directory: "reference" },
				},
			],
			expressiveCode: {
				shiki: {
					// Allow using the alias 'mjs' for the 'javascript' language
					langAlias: {
						mjs: "javascript",
						bash: "bash",
					},
				},
			},
			customCss: ["./src/styles/global.css"],
		}),
		sitemap({
			changefreq: "weekly",
			lastmod: new Date(),
			priority: 0.85,
			serialize(item) {
				// Exclude pages at /cache/**
				// if (item.url.includes('/cache/')) return undefined;
				// Remove trailing slashes
				if (item.url.at(-1) === "/") item.url = item.url.slice(0, -1);
				return item;
			},
		}),
	],
});
