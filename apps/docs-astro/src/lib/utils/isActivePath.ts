/**
 * Checks if the given item path is active based on the current path.
 * @param itemPath - The path to check against the current path.
 * @param currentPath - The current path to compare against.
 * @returns `true` if the item path is active, otherwise `false`.
 */
export const isPathActive = (itemPath: string, currentPath: string) => {
	// Ensure both paths start with / and remove trailing slashes
	const normalizedItemPath = itemPath.replace(/\/+$/, "");
	const normalizedCurrentPath = currentPath.replace(/\/+$/, "");

	// Exact match
	if (normalizedItemPath === normalizedCurrentPath) return true;
	// Check if it's a sub-path, but only at path boundaries
	if (normalizedCurrentPath.startsWith(`${normalizedItemPath}/`)) return true;

	return false;
};
