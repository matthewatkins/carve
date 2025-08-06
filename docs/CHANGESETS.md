# Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing. Changesets help manage versioning in monorepos by tracking changes across multiple packages.

## Quick Start

### Creating a Changeset

When you make changes that should be versioned, create a changeset:

```bash
bun run changeset
```

This will:
1. Ask which packages have changed
2. Ask what type of change (major, minor, patch)
3. Ask for a description of the changes
4. Create a markdown file in `.changesets/`

### Example Changeset

```markdown
---
"@carve/web": patch
"@carve/api-server": minor
"@carve/shared-types": patch
---

Add new authentication features and update shared types

- Added OAuth integration to web app
- Enhanced API server with new endpoints
- Updated shared types for better type safety
```

## Available Commands

### `bun run changeset`
Creates a new changeset for tracking changes.

### `bun run version`
Updates package versions based on changesets and generates changelogs.

### `bun run release`
Builds the project and publishes packages to npm.

## Workflow

### 1. Make Changes
Make your code changes across the monorepo.

### 2. Create Changeset
```bash
bun run changeset
```

### 3. Commit Changes
```bash
git add .
git commit -m "feat: add new authentication features"
```

### 4. Version and Release
```bash
# Update versions and generate changelogs
bun run version

# Build and publish (if ready)
bun run release
```

## Package Versioning

### Apps (apps/*)
- **web**: Frontend application
- **auth-server**: Authentication service
- **api-server**: API service

### Packages (packages/*)
- **api**: Shared API router definitions
- **shared-types**: Common TypeScript interfaces
- **shared-utils**: Shared utilities

## Change Types

- **patch**: Bug fixes and minor improvements
- **minor**: New features (backward compatible)
- **major**: Breaking changes

## Best Practices

1. **Create changesets for all changes** that should be versioned
2. **Use descriptive messages** in changesets
3. **Group related changes** in a single changeset
4. **Review changesets** before versioning
5. **Test thoroughly** before releasing

## Configuration

The changeset configuration is in `.changeset/config.json`:

```json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch"
}
```

## CI/CD Integration

For automated releases, you can add these steps to your CI:

```yaml
- name: Create Release Pull Request or Publish
  uses: changesets/action@v1
  with:
    publish: bun run release
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Troubleshooting

### Common Issues

1. **No changesets found**: Run `bun run changeset` to create one
2. **Version conflicts**: Check for conflicting changesets
3. **Publish failures**: Verify npm tokens and permissions

### Useful Commands

```bash
# List all changesets
bunx changeset status

# Preview version changes
bunx changeset version --dry-run

# Clean up changesets (after versioning)
rm -rf .changesets/*.md
```

## Resources

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Monorepo Versioning Guide](https://github.com/changesets/changesets/blob/main/docs/managing-changesets.md)
- [Publishing Guide](https://github.com/changesets/changesets/blob/main/docs/publishing.md)