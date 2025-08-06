# @matthew.atkins/create-carve

CLI tool for creating new Carve projects with a modern microservices architecture.

## Features

- 🚀 **One-command setup** - Create a complete Carve project in seconds
- 🔄 **Automatic renaming** - All "carve" references renamed to your project name
- 🗄️ **Database setup** - Optional Docker + PostgreSQL + schema creation
- 🔐 **Environment files** - Automatic .env file creation
- 📦 **Dependency management** - Optional dependency installation
- 🐙 **Git integration** - Optional git repository initialization
- 🎯 **Interactive prompts** - Beautiful CLI with validation and confirmations
- 🔧 **Development/Production modes** - Automatically detects environment

## Installation

```bash
# Install globally
npm install -g @matthew.atkins/create-carve

# Or use npx (recommended)
npx @matthew.atkins/create-carve create my-project
```

## Usage

### Create a New Project

```bash
# Interactive mode (will prompt for project name)
npx @carve/create-carve create

# With project name
npx @carve/create-carve create my-awesome-project

# Initialize existing project (rename from carve to new name)
npx @carve/create-carve init my-new-name
```

### What the CLI Does

1. **Downloads template** - From GitHub (production) or local (development)
2. **Renames project** - All "carve" references → your project name
3. **Creates .env files** - Database connections and server configs
4. **Sets up database** - Optional Docker + PostgreSQL + schemas
5. **Installs dependencies** - Optional `bun install`
6. **Initializes git** - Optional git repo with initial commit
7. **Provides instructions** - Clear next steps

### Environment Detection

The CLI automatically detects your environment:

- **Development mode** (uses local template):
  - Running from monorepo directory
  - `NODE_ENV=development`
  - `CARVE_DEV=true`

- **Production mode** (uses GitHub template):
  - Running from external directory
  - Published npm package

## Commands

### `create` - Create New Project

Creates a new Carve project from scratch.

```bash
npx @carve/create-carve create [project-name]
```

**Options:**
- `project-name` - Name of your project (optional, will prompt if not provided)

**Features:**
- Project name validation (lowercase, numbers, hyphens only)
- Template downloading (GitHub or local)
- Automatic project renaming
- Environment file creation
- Optional database setup
- Optional dependency installation
- Optional git initialization

### `init` - Initialize Existing Project

Renames an existing Carve project to a new name.

```bash
npx @carve/create-carve init [new-name]
```

**Options:**
- `new-name` - New project name (optional, will prompt if not provided)

**Features:**
- Renames all "carve" references to new project name
- Updates package.json files
- Updates import statements
- Updates Docker configuration
- Updates README.md
- Cleans up lock files

## Project Structure

After creation, your project will have:

```
my-awesome-project/
├── apps/
│   ├── web/              # Frontend (Nuxt + Vue)
│   ├── auth-server/      # Authentication service
│   └── api-server/       # Business logic service
├── packages/
│   ├── api/              # Shared API router
│   ├── shared-types/     # Common TypeScript types
│   └── shared-utils/     # Shared utilities
├── docker-compose.yml    # Database configuration
├── package.json          # Root package.json
└── README.md            # Project documentation
```

## What Gets Renamed

The CLI automatically updates all references from "carve" to your project name:

- **Package names**: `@carve/api-server` → `@my-project/api-server`
- **Import statements**: `@carve/shared-types` → `@my-project/shared-types`
- **Docker containers**: `carve-postgres` → `my-project-postgres`
- **README titles**: `# Carve - Microservices` → `# My-Project - Microservices`
- **Scripts**: All references in shell scripts

## Environment Files

The CLI creates these environment files automatically:

**`apps/auth-server/.env`**
```env
AUTH_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db
PORT=3001
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:3000
BETTER_AUTH_SECRET=your-super-secret-better-auth-key-change-this-in-production
BETTER_AUTH_URL=http://localhost:3001
```

**`apps/api-server/.env`**
```env
API_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/api_db
PORT=3002
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:3000
AUTH_SERVER_URL=http://localhost:3001
```

## Next Steps

After creation, the CLI provides clear instructions:

```bash
# Navigate to your project
cd my-awesome-project

# Start development
bun dev
```

## Service URLs

- **Web App**: http://localhost:3000
- **Auth Server**: http://localhost:3001
- **API Server**: http://localhost:3002

## Development Commands

- `bun dev` - Start all services
- `bun run dev:web` - Start web app only
- `bun run dev:auth` - Start auth server only
- `bun run dev:api` - Start API server only
- `bun run db:push:auth` - Push auth schema
- `bun run db:push:api` - Push API schema

## Troubleshooting

### Common Issues

**Template download fails:**
- Check your internet connection
- Try running from a different directory
- Use `CARVE_DEV=true` for local development

**Database setup fails:**
- Ensure Docker is installed and running
- Check that port 5432 is available
- Verify Docker Compose is installed

**Permission errors:**
- Ensure you have write permissions in the target directory
- Try running with elevated permissions if needed

**Git initialization fails:**
- Ensure git is installed
- Check that you're not in a git repository already

## Architecture

Carve uses a microservices architecture with:

- **Web App** (Nuxt) - Frontend UI
- **Auth Server** (Hono + Better Auth) - Authentication
- **API Server** (Hono + oRPC) - Business logic
- **Shared Packages** - Type-safe APIs and utilities

For detailed architecture information, see the main [Carve README](../../README.md).

## Contributing

This CLI is part of the Carve monorepo. To contribute:

1. Clone the repository
2. Install dependencies: `bun install`
3. Build the CLI: `cd packages/create-carve && bun run build`
4. Test locally: `bun packages/create-carve/dist/index.js create test-project`

## License

MIT License - see [LICENSE](../../LICENSE.txt) for details.