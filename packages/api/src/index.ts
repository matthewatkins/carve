import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";

// Import the actual router type from the api-server
import type { appRouter } from "../../../apps/api-server/src/routers";

export type ApiClient = RouterClient<typeof appRouter>;

export interface ApiClientConfig {
	baseURL: string;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
	const { baseURL } = config;

	const rpcLink = new RPCLink({
		url: `${baseURL}/rpc`,
		fetch: (request: Request, init: RequestInit) => {
			const headers = new Headers(init?.headers || {});

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
