// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "latest",
	devtools: { enabled: true },
	modules: ["@nuxt/ui"],
	css: ["~/assets/css/main.css"],
	devServer: {
		port: 3000,
	},
	ssr: false,
	runtimeConfig: {
		public: {
			authServerURL:
				process.env.NUXT_PUBLIC_AUTH_SERVER_URL || "http://localhost:3001",
			apiServerURL:
				process.env.NUXT_PUBLIC_API_SERVER_URL || "http://localhost:3002",
		},
	},
});
