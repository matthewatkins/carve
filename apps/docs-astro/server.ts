import { readdirSync } from "node:fs";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

const app = new Hono();

// Add logging middleware to help debug
app.use("*", async (c, next) => {
	console.log(`${c.req.method} ${c.req.url}`);
	await next();
});

// Serve static files from the dist directory
app.use("/*", serveStatic({ root: "./dist" }));

const port = Number.parseInt(process.env.PORT || "4321");
const host = process.env.HOST || "0.0.0.0";

console.log(`Server starting on http://${host}:${port}`);
console.log("Current directory:", process.cwd());
console.log("Files in dist:", readdirSync("./dist"));

export default {
	port,
	fetch: app.fetch,
};
