import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";

// Import the actual router type from the api-server
import type { appRouter } from "../../../apps/api-server/src/routers";

export type ApiClient = RouterClient<typeof appRouter>;

export interface ApiClientConfig {
	baseURL: string;
	getAuthToken?: () => string | null;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
	const { baseURL, getAuthToken } = config;

	const rpcLink = new RPCLink({
		url: `${baseURL}/rpc`,
		fetch: (request: Request, init: RequestInit) => {
			const headers = new Headers(init?.headers || {});

			// Add auth token if available
			if (getAuthToken) {
				const token = getAuthToken();
				if (token) {
					headers.set("Authorization", `Bearer ${token}`);
				}
			}

			return fetch(request, {
				...init,
				headers: headers as HeadersInit,
				credentials: "include",
			});
		},
	});

	return createORPCClient(rpcLink);
}

// Re-export types for convenience
export type { ApiContext } from "@carve/shared-types";
export type { appRouter } from "../../../apps/api-server/src/routers";
