import "dotenv/config";
import { cors } from "@elysiajs/cors";
import { RPCHandler } from "@orpc/server/fetch";
import { Elysia } from "elysia";
import { createContext } from "./lib/context";
import { appRouter } from "./routers";

const handler = new RPCHandler(appRouter);

const _app = new Elysia()
	.use(
		cors({
			origin: process.env.CORS_ORIGIN || "http://localhost:3000",
			methods: ["GET", "POST", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.all("/rpc*", async (context) => {
		const { response } = await handler.handle(context.request, {
			prefix: "/rpc",
			context: await createContext({ context }),
		});
		return response ?? new Response("Not Found", { status: 404 });
	})
	.get("/", () => "API Server OK")
	.listen(3002, () => {
		console.log("API Server is running on http://localhost:3002");
	});
