# Carve Project Initialization

This document explains how to initialize a new project from the Carve template using the interactive `carve.sh` script.

## Overview

The Carve template contains references to "carve" in various places:
- Package names in `package.json` files
- Import statements throughout the codebase
- Docker container names
- README.md content
- Scripts and documentation

The `carve.sh` script provides a comprehensive interactive solution for initializing a new project from the template.

## Interactive Initialization (Recommended)

The `scripts/carve.sh` script provides a complete interactive setup experience.

### Usage

```bash
# Interactive initialization
bun run carve

# Or run directly
bash scripts/carve.sh
```

### Features

- 🎯 **Interactive prompts** with project name detection
- 📁 **Automatic detection** of project name from directory
- ✅ **Input validation** and confirmation
- 🔄 **Automatic backup** creation
- 📦 **Optional dependency installation**
- 🐳 **Optional database setup**
- 🧹 **Optional backup cleanup**
- 🎨 **Beautiful colored output** with progress indicators

### What it does

1. **Creates a backup** of your current project
2. **Updates all package.json files** with new package names
3. **Replaces import statements** in TypeScript/JavaScript files
4. **Updates Docker configuration** (container names, etc.)
5. **Updates README.md** content
6. **Removes lock files** that need regeneration
7. **Optionally installs dependencies** with `bun install`
8. **Optionally sets up database** with Docker and schema push
9. **Optionally cleans up backup** directory
10. **Provides clear next steps** for completing the setup

### Example Flow

```bash
$ bun run carve

🚀 Project Initialization

ℹ️  Detected project name from directory: my-awesome-app
Enter your project name (my-awesome-app):
ℹ️  Initializing project: my-awesome-app
Proceed with renaming to 'my-awesome-app'? (y/N) (n): y
ℹ️  Creating backup...
✅ Backup created in .backup-20250718-122348
ℹ️  Updating package.json files...
✅ Updated package.json
✅ Updated apps/api-server/package.json
...
ℹ️  Updating import statements...
ℹ️  Updating Docker configuration...
ℹ️  Updating README.md...
ℹ️  Updating scripts...
ℹ️  Cleaning up lock files...
✅ Project initialization complete!

Would you like to install dependencies now? (y/N) (n): y
📦 Installing Dependencies
ℹ️  Installing dependencies...
✅ Dependencies installed successfully!

Would you like to start the database and set up schemas? (y/N) (n): y
🐳 Setting Up Database
ℹ️  Starting database with Docker...
✅ Database started successfully!
ℹ️  Waiting for database to be ready...
ℹ️  Setting up database schemas...
✅ Database schemas set up successfully!

🎉 Setup Complete!
Your project has been fully initialized and set up!

Next steps:
1. Set up your environment variables (see README.md)
2. Start development: bun dev

Service URLs:
- Web App: http://localhost:3000
- Auth Server: http://localhost:3001
- API Server: http://localhost:3002

Would you like to delete the backup directory? (.backup-20250718-122348) (y/N) (n): y
✅ Backup deleted successfully!
```

## Manual Approach

If you prefer to rename manually, here are the key files to update:

### Package.json Files
- `package.json` (root)
- `apps/api-server/package.json`
- `apps/auth-server/package.json`
- `apps/web/package.json`
- `packages/api/package.json`
- `packages/shared-types/package.json`
- `packages/shared-utils/package.json`

### Import Statements
Search for and replace `@carve/` with `@your-new-name/` in:
- All `.ts` files
- All `.js` files
- All `.vue` files

### Docker Configuration
- `docker-compose.yml` - Update container names

### Documentation
- `README.md` - Update project title and references

### Lock Files
- Remove `bun.lock`, `package-lock.json`, or `yarn.lock`
- Run `bun install` to regenerate

## Validation

After initialization, verify the changes:

1. **Check package names**: `grep -r "name.*carve" .`
2. **Check imports**: `grep -r "@carve/" .`
3. **Test installation**: `bun install`
4. **Test builds**: `bun run build`
5. **Test development**: `bun run dev`

## Best Practices

1. **Always create a backup** before initialization (handled automatically)
2. **Use lowercase with hyphens** for project names
3. **Test thoroughly** after initialization
4. **Update documentation** that references the old name
5. **Consider using the interactive script** for the best experience

## Troubleshooting

### Common Issues

1. **Lock file conflicts**: Remove lock files and reinstall
2. **Import errors**: Check for missed import statements
3. **Docker issues**: Update container names in docker-compose.yml
4. **Build failures**: Verify all package names are updated

### Recovery

If something goes wrong, you can restore from the backup created by the carve script:
```bash
# Restore from backup
cp -r .backup-YYYYMMDD-HHMMSS/* .
```

## Quick Start

For new projects, simply run:

```bash
# Clone the template
git clone <template-url> my-new-project
cd my-new-project

# Initialize the project
bun run carve

# Follow the interactive prompts
```

This will give you a fully functional project ready for development!