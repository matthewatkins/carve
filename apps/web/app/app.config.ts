export default defineAppConfig({
	// https://ui.nuxt.com/getting-started/theme#design-system
	ui: {
		colors: {
			primary: "gold",
			neutral: "gray",
		},
		button: {
			slots: {
				root: "rounded-none",
			},
			defaultVariants: {
				// Set default button color to neutral
				rounded: "none",
			},
		},
	},
});
