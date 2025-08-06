#!/usr/bin/env node

import { defineCommand, runMain } from "citty";
import { create } from "./commands/create";
import { init } from "./commands/init";

const main = defineCommand({
	meta: {
		name: "create-carve",
		version: "0.1.0",
		description: "CLI tool for creating new Carve projects",
	},
	subCommands: {
		create,
		init,
	},
});

runMain(main);
