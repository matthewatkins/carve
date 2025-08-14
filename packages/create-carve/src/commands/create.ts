import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { confirm, intro, note, outro, spinner, text } from "@clack/prompts";
import { defineCommand } from "citty";
import { consola } from "consola";
import { execa } from "execa";
import { downloadTemplate } from "giget";
import { glob } from "glob";

export const create = defineCommand({
	meta: {
		name: "create",
		description: "Create a new Carve project",
	},
	args: {
		name: {
			type: "positional",
			description: "Project name",
			required: false,
		},
	},
	async run({ args }) {
		intro("🚀 Create Carve Project");

		// Get project name
		let projectName = args.name;
		if (!projectName) {
			projectName = (await text({
				message: "What is your project named?",
				placeholder: "my-carve-app",
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

		// Check if directory already exists
		const targetDir = join(process.cwd(), projectName);
		if (existsSync(targetDir)) {
			const shouldOverwrite = (await confirm({
				message: `Directory "${projectName}" already exists. Overwrite it?`,
				initialValue: false,
			})) as boolean;

			if (!shouldOverwrite) {
				consola.info("Operation cancelled");
				process.exit(0);
			}

			rmSync(targetDir, { recursive: true, force: true });
		}

		// Download template
		const s = spinner();
		s.start("Downloading Carve template...");

		try {
			// Detect if we're in development mode by checking if we're running from the monorepo
			const isDevelopment =
				process.env.NODE_ENV === "development" ||
				process.env.CARVE_DEV === "true";

			if (isDevelopment) {
				// For development, copy the template directory directly
				const templateDir = "/Users/atkins/code/projects/carve-template";
				await execa("cp", ["-r", templateDir, targetDir]);
			} else {
				// For production, download from GitHub
				await downloadTemplate("gh:matthewatkins/carve-template", {
					dir: targetDir,
					force: true,
				});
			}
			s.stop("Template downloaded successfully");
		} catch (error) {
			s.stop("Failed to download template");
			consola.error("Failed to download template:", error);
			process.exit(1);
		}

		// Navigate to project directory
		process.chdir(targetDir);

		// Rename project references from "carve" to new project name
		s.start("Updating project references...");
		try {
			const oldName = "carve";
			const newName = projectName;

			// Files to process
			const filesToProcess = [
				"package.json",
				"apps/api-server/package.json",
				"apps/auth-server/package.json",
				"apps/web/package.json",
				"packages/api/package.json",
				"packages/shared-types/package.json",
				"packages/shared-utils/package.json",
				"docker-compose.yml",
				"README.md",
				"scripts/dev.sh",
			];

			// Update package.json files
			for (const file of filesToProcess) {
				if (existsSync(file)) {
					try {
						let content = readFileSync(file, "utf-8");

						// Replace package names
						content = content.replace(
							new RegExp(`"@${oldName}/`, "g"),
							`"@${newName}/`,
						);
						content = content.replace(
							new RegExp(`"name": "${oldName}"`, "g"),
							`"name": "${newName}"`,
						);
						content = content.replace(
							new RegExp(`"name": "@${oldName}/`, "g"),
							`"name": "@${newName}/`,
						);

						writeFileSync(file, content);
						consola.success(`Updated ${file}`);
					} catch (error) {
						consola.warn(`Failed to update ${file}:`, error);
					}
				}
			}

			// Update turbo filter commands in root package.json
			if (existsSync("package.json")) {
				try {
					let content = readFileSync("package.json", "utf-8");
					content = content.replace(
						new RegExp(`turbo -F @${oldName}/`, "g"),
						`turbo -F @${newName}/`,
					);
					writeFileSync("package.json", content);
				} catch (error) {
					consola.warn("Failed to update turbo filter commands:", error);
				}
			}

			// Update import statements in TypeScript/JavaScript files
			const importPatterns = [
				"apps/api-server/src",
				"apps/auth-server/src",
				"apps/web/app",
				"packages/api/src",
				"packages/shared-types/src",
				"packages/shared-utils/src",
			];

			for (const pattern of importPatterns) {
				if (existsSync(pattern)) {
					try {
						const files = await glob(`${pattern}/**/*.{ts,js,vue}`);
						for (const file of files) {
							try {
								let content = readFileSync(file, "utf-8");
								content = content.replace(
									new RegExp(`@${oldName}/`, "g"),
									`@${newName}/`,
								);
								writeFileSync(file, content);
							} catch (error) {
								consola.warn(`Failed to update ${file}:`, error);
							}
						}
					} catch (error) {
						consola.warn(`Failed to process pattern ${pattern}:`, error);
					}
				}
			}

			// Update Docker configuration
			if (existsSync("docker-compose.yml")) {
				try {
					let content = readFileSync("docker-compose.yml", "utf-8");
					content = content.replace(
						new RegExp(`name: '${oldName}'`, "g"),
						`name: '${newName}'`,
					);
					content = content.replace(
						new RegExp(`container_name: ${oldName}_postgres`, "g"),
						`container_name: ${newName}_postgres`,
					);
					writeFileSync("docker-compose.yml", content);
				} catch (error) {
					consola.warn("Failed to update Docker configuration:", error);
				}
			}

			// Update README.md
			if (existsSync("README.md")) {
				try {
					let content = readFileSync("README.md", "utf-8");
					content = content.replace(
						new RegExp(`# ${oldName} - Microservices Architecture`, "g"),
						`# ${newName} - Microservices Architecture`,
					);
					content = content.replace(
						new RegExp(`docker logs ${oldName}-postgres`, "g"),
						`docker logs ${newName}-postgres`,
					);
					content = content.replace(
						new RegExp(`${oldName}/`, "g"),
						`${newName}/`,
					);
					writeFileSync("README.md", content);
				} catch (error) {
					consola.warn("Failed to update README.md:", error);
				}
			}

			// Update scripts
			if (existsSync("scripts/dev.sh")) {
				try {
					let content = readFileSync("scripts/dev.sh", "utf-8");
					// Replace scope references (e.g., @carve/ -> @new-name/)
					content = content.replace(
						new RegExp(`@${oldName}/`, "g"),
						`@${newName}/`,
					);
					// Replace full package references (e.g., @carve/shared-types -> @new-name/shared-types)
					content = content.replace(
						new RegExp(`@${oldName}/shared-types`, "g"),
						`@${newName}/shared-types`,
					);
					content = content.replace(
						new RegExp(`@${oldName}/shared-utils`, "g"),
						`@${newName}/shared-utils`,
					);
					writeFileSync("scripts/dev.sh", content);
				} catch (error) {
					consola.warn("Failed to update scripts:", error);
				}
			}

			s.stop("Project references updated successfully");
		} catch (_error) {
			s.stop("Failed to update project references");
			consola.warn("You may need to update references manually");
		}

		// Detect package manager
		const detectPackageManager = () => {
			if (existsSync("bun.lock")) return "bun";
			if (existsSync("pnpm-lock.yaml")) return "pnpm";
			if (existsSync("yarn.lock")) return "yarn";
			if (existsSync("package-lock.json")) return "npm";
			return "bun"; // Default to bun
		};

		// Ask if user wants to install dependencies
		const installDeps = (await confirm({
			message: "Would you like to install dependencies now?",
			initialValue: false,
		})) as boolean;

		if (installDeps) {
			const packageManager = detectPackageManager();
			s.start(`Installing dependencies with ${packageManager}...`);
			try {
				if (packageManager === "bun") {
					await execa("bun", ["install"], { stdio: "inherit" });
				} else if (packageManager === "pnpm") {
					await execa("pnpm", ["install"], { stdio: "inherit" });
				} else if (packageManager === "yarn") {
					await execa("yarn", ["install"], { stdio: "inherit" });
				} else {
					await execa("npm", ["install"], { stdio: "inherit" });
				}
				s.stop("Dependencies installed successfully");
			} catch (error) {
				s.stop("Failed to install dependencies");
				consola.error("Failed to install dependencies:", error);
			}
		}

		// Create .env files FIRST (needed for database setup)
		s.start("Creating environment files...");
		try {
			// Create auth-server .env
			const authEnvPath = join("apps", "auth-server", ".env");
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

			// Create api-server .env
			const apiEnvPath = join("apps", "api-server", ".env");
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

			s.stop("Environment files created successfully");
		} catch (_error) {
			s.stop("Failed to create environment files");
			consola.warn("You may need to create .env files manually");
		}

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
							`${projectName}-postgres`,
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
							`${projectName}-postgres`,
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
					const packageManager = detectPackageManager();
					if (packageManager === "bun") {
						await execa("bun", ["run", "db:push:auth"], { stdio: "inherit" });
						await execa("bun", ["run", "db:push:api"], { stdio: "inherit" });
					} else if (packageManager === "pnpm") {
						await execa("pnpm", ["run", "db:push:auth"], { stdio: "inherit" });
						await execa("pnpm", ["run", "db:push:api"], { stdio: "inherit" });
					} else if (packageManager === "yarn") {
						await execa("yarn", ["run", "db:push:auth"], { stdio: "inherit" });
						await execa("yarn", ["run", "db:push:api"], { stdio: "inherit" });
					} else {
						await execa("npm", ["run", "db:push:auth"], { stdio: "inherit" });
						await execa("npm", ["run", "db:push:api"], { stdio: "inherit" });
					}
					s.stop("Database schemas set up successfully");
				} catch (_error) {
					s.stop("Failed to set up database schemas");
					consola.warn("You may need to check your environment variables");
				}
			} catch (_error) {
				s.stop("Failed to start database");
				consola.warn(
					"You may need to install Docker or check your Docker setup",
				);
			}
		}

		// Stop spinner before user prompts
		s.stop();

		// Ask if user wants to initialize git repository
		const initGit = (await confirm({
			message: "Would you like to initialize a git repository?",
			initialValue: true,
		})) as boolean;

		if (initGit) {
			s.start("Initializing git repository...");
			try {
				await execa("git", ["init"], { stdio: "inherit" });
				await execa("git", ["add", "."], { stdio: "inherit" });
				await execa("git", ["commit", "-m", "Initial commit"], {
					stdio: "inherit",
				});
				s.stop("Git repository initialized successfully");
			} catch (_error) {
				s.stop("Failed to initialize git repository");
				consola.warn(
					"You can initialize git manually: git init && git add . && git commit -m 'Initial commit'",
				);
			}
		}

		// Success message
		outro("🎉 Project created successfully!");

		const packageManager = detectPackageManager();
		const runCommand =
			packageManager === "bun"
				? "bun"
				: packageManager === "pnpm"
					? "pnpm"
					: packageManager === "yarn"
						? "yarn"
						: "npm";

		note(
			`
Next steps:
1. cd ${projectName}
2. ${runCommand} dev

Service URLs:
- Web App: http://localhost:3000
- Auth Server: http://localhost:3001
- API Server: http://localhost:3002

Development Commands:
- ${runCommand} dev          # Start all services
- ${runCommand} run dev:web  # Start web app only
- ${runCommand} run dev:auth # Start auth server only
- ${runCommand} run dev:api  # Start API server only
     `,
			"Next Steps",
		);

		// Ensure clean exit
		process.exit(0);
	},
});
