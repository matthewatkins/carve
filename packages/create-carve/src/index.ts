#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { defineCommand, runMain } from "citty";
import { create } from "./commands/create";
import { init } from "./commands/init";

// Read version from package.json
const packageJson = JSON.parse(
	readFileSync(join(__dirname, "../package.json"), "utf-8"),
);

const main = defineCommand({
	meta: {
		name: "create-carve",
		version: packageJson.version,
		description: "CLI tool for creating new Carve projects",
	},
	subCommands: {
		create,
		init,
	},
});

runMain(main);
