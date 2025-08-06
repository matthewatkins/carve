import { createAuthClient } from "better-auth/vue";

export default defineNuxtPlugin((_nuxtApp) => {
	const config = useRuntimeConfig();
	const authServerUrl = config.public.authServerURL;

	const authClient = createAuthClient({
		baseURL: authServerUrl,
	});

	return {
		provide: {
			authClient: authClient,
		},
	};
});
