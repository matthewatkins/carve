import type { ApiContext, AuthContext } from "@carve/shared-types";
import type { Context as ElysiaContext } from "elysia";

export type CreateContextOptions = {
	context: ElysiaContext;
};

export async function createContext({
	context,
}: CreateContextOptions): Promise<ApiContext> {
	// Call auth-server to validate Better Auth session
	try {
		const authServerUrl =
			process.env.AUTH_SERVER_URL || "http://localhost:3001";

		const response = await fetch(`${authServerUrl}/api/validate-session`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			// Forward all cookies from the original request
			body: JSON.stringify({
				cookies: context.request.headers.get("cookie") || "",
			}),
		});

		if (!response.ok) {
			return { auth: null };
		}

		const result = await response.json();
		if (!result.valid) {
			return { auth: null };
		}

		const authContext: AuthContext = {
			user: result.user,
			session: result.session,
		};

		return { auth: authContext };
	} catch (error) {
		console.error("Error validating auth with auth-server:", error);
		return { auth: null };
	}
}
