#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { create } from "./commands/create.js";
import { init } from "./commands/init.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
	readFileSync(join(__dirname, "../package.json"), "utf-8"),
);

function showHelp() {
	console.log(
		`CLI tool for creating new Carve projects (create-carve-app v${packageJson.version})`,
	);
	console.log("\nUsage:");
	console.log(
		"  create-carve-app <project-name>           # Create new project",
	);
	console.log(
		"  create-carve-app create <project-name>    # Explicit create command",
	);
	console.log(
		"  create-carve-app init [project-name]      # Initialize existing project",
	);
	console.log("  bun create carve-app <project-name>       # Via bun create");
	console.log("\nExamples:");
	console.log("  create-carve-app my-app");
	console.log("  bun create carve-app my-app");
	console.log("  create-carve-app init my-existing-project");
}

async function main() {
	const args = process.argv.slice(2);
	const [command, projectName] = args;

	// Handle help and version
	if (!command || command === "--help" || command === "-h") {
		showHelp();
		return;
	}

	if (command === "--version" || command === "-v") {
		console.log(packageJson.version);
		return;
	}

	// Create mock context for commands (to match existing command structure)
	const createMockContext = (name: string) => ({
		args: { name, _: [] },
		cmd: { meta: { name: command } },
		rawArgs: args,
	});

	try {
		// Handle explicit commands
		if (command === "create" && create?.run) {
			await create.run(createMockContext(projectName));
		} else if (command === "init" && init?.run) {
			await init.run(createMockContext(projectName));
		} else if (create?.run) {
			// Default to create command
			await create.run(createMockContext(command));
		} else {
			console.error("Error: Commands not available");
			process.exit(1);
		}
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

main();
