import { defineNuxtPlugin, useRuntimeConfig } from "#app";
import { createApiClient } from "../../../../packages/api/src";

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();
	const apiServerUrl = config.public.apiServerURL;

	const apiClient = createApiClient({
		baseURL: apiServerUrl,
		getAuthToken: () => {
			// Get token from localStorage, cookies, or auth client
			return localStorage.getItem("auth-token") || null;
		},
	});

	return {
		provide: {
			api: apiClient,
		},
	};
});
