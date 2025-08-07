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
	subCommands: {
		create,
		init,
	},
});

runMain(main);
