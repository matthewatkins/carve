#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineCommand, runMain } from "citty";
import { create } from "./commands/create.js";
import { init } from "./commands/init.js";

// Read version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
	readFileSync(join(__dirname, "../package.json"), "utf-8"),
);

const main = defineCommand({
	meta: {
		name: "create-carve-app",
		version: packageJson.version,
		description: "CLI tool for creating new Carve projects",
	},
	args: {
		// Accept project name as first argument when no subcommand
		name: {
			type: "positional",
			description: "Project name (defaults to create command)",
			required: false,
		},
	},
	subCommands: {
		create,
		init,
	},
	// Default behavior - run create command
	async run(ctx) {
		// If a project name is provided as first arg, treat it as create command
		if (ctx.args.name && create?.run) {
			return create.run({
				args: { name: ctx.args.name, _: [] },
				cmd: create,
				rawArgs: ctx.rawArgs,
			});
		}

		// Otherwise show help
		console.log("CLI tool for creating new Carve projects");
		console.log("\nAvailable commands:");
		console.log("  create <name>  Create a new Carve project");
		console.log("  init [name]    Initialize existing project");
		console.log("\nUsage:");
		console.log("  create-carve-app create my-app");
		console.log("  create-carve-app my-app          # same as above");
		console.log(
			"  bun create carve-app my-app      # when used with bun create",
		);
	},
});

runMain(main);
