import type { ApiContext, AuthContext } from "@carve/shared-types";
import { extractTokenFromHeader, verifyJWT } from "@carve/shared-utils";
import type { Context as ElysiaContext } from "elysia";

export type CreateContextOptions = {
	context: ElysiaContext;
};

export async function createContext({
	context,
}: CreateContextOptions): Promise<ApiContext> {
	const authHeader = context.request.headers.get("authorization");
	const token = extractTokenFromHeader(authHeader || undefined);

	if (!token) {
		return { auth: null };
	}

	// Validate JWT token
	const payload = verifyJWT(token, process.env.JWT_SECRET || "fallback-secret");
	if (!payload) {
		return { auth: null };
	}

	// Call auth-server to validate session
	try {
		const authServerUrl =
			process.env.AUTH_SERVER_URL || "http://localhost:3001";
		const response = await fetch(`${authServerUrl}/api/validate-jwt`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
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
