import "dotenv/config";
import type { JWTPayload } from "@carve/shared-types";
import { createJWT, verifyJWT } from "@carve/shared-utils";
import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { auth } from "./lib/auth";

const _app = new Elysia()
	.use(
		cors({
			origin: process.env.CORS_ORIGIN || "http://localhost:3000",
			methods: ["GET", "POST", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	// Better Auth endpoints
	.all("/api/auth/*", async (context) => {
		const { request } = context;
		if (["POST", "GET"].includes(request.method)) {
			return auth.handler(request);
		}
		context.error(405);
	})
	// Session validation endpoint for API server
	.post("/api/validate-session", async ({ request }) => {
		const authHeader = request.headers.get("authorization");
		if (!authHeader) {
			return new Response(
				JSON.stringify({ valid: false, error: "No authorization header" }),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) {
			return new Response(
				JSON.stringify({ valid: false, error: "Invalid session" }),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Create JWT token for API server
		const jwtPayload: Omit<JWTPayload, "exp" | "iat"> = {
			userId: session.user.id,
			sessionId: session.session.id,
		};

		const token = createJWT(
			jwtPayload,
			process.env.JWT_SECRET || "fallback-secret",
		);

		return new Response(
			JSON.stringify({
				valid: true,
				user: session.user,
				session: session.session,
				token,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			},
		);
	})
	// JWT validation endpoint
	.post("/api/validate-jwt", async ({ request }) => {
		const authHeader = request.headers.get("authorization");
		if (!authHeader) {
			return new Response(
				JSON.stringify({ valid: false, error: "No authorization header" }),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const token = authHeader.replace("Bearer ", "");
		const payload = verifyJWT(
			token,
			process.env.JWT_SECRET || "fallback-secret",
		);

		if (!payload) {
			return new Response(
				JSON.stringify({ valid: false, error: "Invalid token" }),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Verify session still exists
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session || session.session.id !== payload.sessionId) {
			return new Response(
				JSON.stringify({ valid: false, error: "Session expired" }),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		return new Response(
			JSON.stringify({
				valid: true,
				user: session.user,
				session: session,
				payload,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			},
		);
	})
	.get("/", () => "Auth Server OK")
	.listen(3001, () => {
		console.log("Auth Server is running on http://localhost:3001");
	});
