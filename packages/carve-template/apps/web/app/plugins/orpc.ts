import { defineNuxtPlugin, useRuntimeConfig } from "#app";
import { createApiClient } from "../../../../packages/api/src";

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();
	const apiServerUrl = config.public.apiServerURL;

	const apiClient = createApiClient({
		baseURL: apiServerUrl,
	});

	return {
		provide: {
			api: apiClient,
		},
	};
});
