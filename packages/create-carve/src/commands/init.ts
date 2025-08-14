import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { confirm, intro, note, outro, spinner, text } from "@clack/prompts";
import { defineCommand } from "citty";
import { consola } from "consola";
import { execa } from "execa";
import { updateAllProjectReferences } from "../shared/rename-utils.js";

export const init = defineCommand({
	meta: {
		name: "init",
		description:
			"Initialize an existing Carve project (rename from carve to new project name)",
	},
	args: {
		name: {
			type: "positional",
			description: "New project name",
			required: false,
		},
	},
	async run({ args }) {
		intro("🚀 Initialize Carve Project");

		// Get project name
		let projectName = args.name;
		if (!projectName) {
			// Get suggested name from current directory
			const currentDir = process.cwd();
			const dirName = currentDir.split("/").pop() || "my-carve-app";
			const suggestedName = dirName.toLowerCase().replace(/[^a-z0-9-]/g, "-");

			projectName = (await text({
				message: "What is your project named?",
				placeholder: suggestedName,
				initialValue: suggestedName,
				validate: (value) => {
					if (!value) return "Project name is required";
					if (!/^[a-z0-9-]+$/.test(value)) {
						return "Project name must contain only lowercase letters, numbers, and hyphens";
					}
					if (value.startsWith("-") || value.endsWith("-")) {
						return "Project name cannot start or end with a hyphen";
					}
					if (value.length > 50) {
						return "Project name must be 50 characters or less";
					}
					return undefined;
				},
			})) as string;
		}

		if (!projectName) {
			consola.error("Project name is required");
			process.exit(1);
		}

		// Validate project name
		if (!/^[a-z0-9-]+$/.test(projectName)) {
			consola.error(
				"Project name must contain only lowercase letters, numbers, and hyphens",
			);
			process.exit(1);
		}

		if (projectName.startsWith("-") || projectName.endsWith("-")) {
			consola.error("Project name cannot start or end with a hyphen");
			process.exit(1);
		}

		if (projectName.length > 50) {
			consola.error("Project name must be 50 characters or less");
			process.exit(1);
		}

		consola.info(`Initializing project: ${projectName}`);

		// Confirm before proceeding
		const shouldProceed = (await confirm({
			message: `Proceed with renaming to '${projectName}'?`,
			initialValue: false,
		})) as boolean;

		if (!shouldProceed) {
			consola.info("Initialization cancelled");
			process.exit(0);
		}

		const s = spinner();

		const oldName = "carve";
		const newName = projectName;

		// Update all project references using shared utilities
		s.start("Updating project references...");
		await updateAllProjectReferences(oldName, newName);
		s.stop("Project references updated");

		// Remove lock files
		s.start("Cleaning up lock files...");
		const lockFiles = ["bun.lock", "package-lock.json", "yarn.lock"];
		for (const lockFile of lockFiles) {
			if (existsSync(lockFile)) {
				try {
					await execa("rm", [lockFile]);
					consola.warn(`Removed ${lockFile} - run 'bun install' to regenerate`);
				} catch (error) {
					consola.warn(`Failed to remove ${lockFile}:`, error);
				}
			}
		}
		s.stop("Lock files cleaned up");

		consola.success("Project initialization complete!");

		// Ask if user wants to install dependencies
		const installDeps = (await confirm({
			message: "Would you like to install dependencies now?",
			initialValue: false,
		})) as boolean;

		if (installDeps) {
			s.start("Installing dependencies...");
			try {
				await execa("bun", ["install"], { stdio: "inherit" });
				s.stop("Dependencies installed successfully");

				// Ask if user wants to set up database
				const setupDb = (await confirm({
					message: "Would you like to start the database and set up schemas?",
					initialValue: false,
				})) as boolean;

				if (setupDb) {
					s.start("Starting database...");
					try {
						await execa("docker-compose", ["up", "--build", "-d"], {
							stdio: "inherit",
						});
						s.stop("Database started successfully");

						// Wait for database to be ready
						s.start("Waiting for database to be ready...");
						await new Promise((resolve) => setTimeout(resolve, 10000));

						// Create databases if they don't exist
						s.start("Creating databases...");
						try {
							await execa(
								"docker",
								[
									"exec",
									`${newName}-postgres`,
									"psql",
									"-U",
									"postgres",
									"-c",
									"CREATE DATABASE auth_db;",
								],
								{ stdio: "pipe" },
							);
							await execa(
								"docker",
								[
									"exec",
									`${newName}-postgres`,
									"psql",
									"-U",
									"postgres",
									"-c",
									"CREATE DATABASE api_db;",
								],
								{ stdio: "pipe" },
							);
							s.stop("Databases created successfully");
						} catch (_error) {
							// Databases might already exist, which is fine
							s.stop("Databases already exist");
						}

						// Push schemas
						s.start("Setting up database schemas...");
						try {
							await execa("bun", ["run", "db:push:auth"], { stdio: "inherit" });
							await execa("bun", ["run", "db:push:api"], { stdio: "inherit" });
							s.stop("Database schemas set up successfully");

							consola.success("🎉 Setup Complete!");
							note(
								`
Your project has been fully initialized and set up!

Next steps:
1. Set up your environment variables (see README.md)
2. Start development: bun dev

Service URLs:
- Web App: http://localhost:3000
- Auth Server: http://localhost:3001
- API Server: http://localhost:3002
               `,
								"Setup Complete",
							);
						} catch (_error) {
							s.stop("Failed to set up database schemas");
							consola.warn("You may need to check your environment variables");
							consola.info(
								"You can try manually: bun run db:push:auth && bun run db:push:api",
							);
						}
					} catch (_error) {
						s.stop("Failed to start database");
						consola.warn(
							"You may need to install Docker or check your Docker setup",
						);
						consola.info(
							"You can try starting it manually with: docker-compose up --build -d",
						);
					}
				} else {
					note(
						`
Next steps:
1. Set up your environment variables (see README.md)
2. Start database: docker-compose up --build -d
3. Push database schemas: bun run db:push:auth && bun run db:push:api
4. Start development: bun dev
           `,
						"Next Steps",
					);
				}
			} catch (error) {
				s.stop("Failed to install dependencies");
				consola.error("Failed to install dependencies:", error);
				process.exit(1);
			}
		} else {
			// Create .env files even if not setting up database
			s.start("Creating .env files for database connections...");
			try {
				// Create auth-server .env
				const authEnvPath = join("apps", "auth-server", ".env");
				if (!existsSync(authEnvPath)) {
					const authEnvContent = `# Database Configuration
AUTH_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db

# Server Configuration
PORT=3001
HOST=0.0.0.0

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Better Auth Configuration
BETTER_AUTH_SECRET=your-super-secret-better-auth-key-change-this-in-production
BETTER_AUTH_URL=http://localhost:3001`;

					mkdirSync(join("apps", "auth-server"), { recursive: true });
					writeFileSync(authEnvPath, authEnvContent);
					consola.success("Created apps/auth-server/.env");
				}

				// Create api-server .env
				const apiEnvPath = join("apps", "api-server", ".env");
				if (!existsSync(apiEnvPath)) {
					const apiEnvContent = `# Database Configuration
API_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/api_db

# Server Configuration
PORT=3002
HOST=0.0.0.0

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Auth Server URL
AUTH_SERVER_URL=http://localhost:3001`;

					mkdirSync(join("apps", "api-server"), { recursive: true });
					writeFileSync(apiEnvPath, apiEnvContent);
					consola.success("Created apps/api-server/.env");
				}

				s.stop("Environment files created successfully");
			} catch (_error) {
				s.stop("Failed to create environment files");
				consola.warn("You may need to create .env files manually");
			}

			note(
				`
Next steps:
1. Run 'bun install' to install dependencies
2. Set up your environment variables (see README.md)
3. Start database: docker-compose up --build -d
4. Push database schemas: bun run db:push:auth && bun run db:push:api
5. Start development: bun dev
6. Update any remaining references manually if needed
       `,
				"Next Steps",
			);
		}

		outro("🔪 Carve project initialized!");
	},
});
