import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { consola } from "consola";
import { glob } from "glob";

// Files to process for package.json updates
const PACKAGE_FILES = [
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

// Import statement patterns to update
const IMPORT_PATTERNS = [
	"apps/api-server/src",
	"apps/auth-server/src",
	"apps/web/app",
	"packages/api/src",
	"packages/shared-types/src",
	"packages/shared-utils/src",
];

/**
 * Update package.json files with new project name
 */
export async function updatePackageFiles(
	oldName: string,
	newName: string,
): Promise<void> {
	for (const file of PACKAGE_FILES) {
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
}

/**
 * Update turbo filter commands in root package.json
 */
export async function updateTurboCommands(
	oldName: string,
	newName: string,
): Promise<void> {
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
}

/**
 * Update import statements in TypeScript/JavaScript files
 */
export async function updateImportStatements(
	oldName: string,
	newName: string,
): Promise<void> {
	for (const pattern of IMPORT_PATTERNS) {
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
}

/**
 * Update Docker configuration
 */
export async function updateDockerConfig(
	oldName: string,
	newName: string,
): Promise<void> {
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
}

/**
 * Update README.md
 */
export async function updateReadme(
	oldName: string,
	newName: string,
): Promise<void> {
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
			content = content.replace(new RegExp(`${oldName}/`, "g"), `${newName}/`);
			writeFileSync("README.md", content);
		} catch (error) {
			consola.warn("Failed to update README.md:", error);
		}
	}
}

/**
 * Update scripts/dev.sh with new project name
 */
export async function updateScripts(
	oldName: string,
	newName: string,
): Promise<void> {
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
}

/**
 * Update all project references (main orchestrator function)
 */
export async function updateAllProjectReferences(
	oldName: string,
	newName: string,
): Promise<void> {
	await updatePackageFiles(oldName, newName);
	await updateTurboCommands(oldName, newName);
	await updateImportStatements(oldName, newName);
	await updateDockerConfig(oldName, newName);
	await updateReadme(oldName, newName);
	await updateScripts(oldName, newName);
}
