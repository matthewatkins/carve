import "dotenv/config";
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
		// Parse forwarded cookies if present
		let headers = request.headers;

		try {
			const body = await request.json();
			if (body.cookies) {
				// Create new headers with forwarded cookies
				const newHeaders = new Headers(headers);
				newHeaders.set("cookie", body.cookies);
				headers = newHeaders;
			}
		} catch {
			// No body or invalid JSON, use original headers
		}

		const session = await auth.api.getSession({ headers });

		if (!session) {
			return new Response(
				JSON.stringify({ valid: false, error: "Invalid session" }),
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
				session: session.session,
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
