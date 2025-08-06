# Carve

A modern TypeScript stack with microservices architecture, combining Nuxt, Elysia, ORPC, Better Auth, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Nuxt** - The Intuitive Vue Framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Elysia** - Type safe server framework
- **oRPC** - End-to-end type-safe APIs with OpenAPI integration
- **Bun** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Email & password authentication with Better Auth
- **Better Auth Sessions** - Service-to-service authentication
- **Biome** - Linting and formatting
- **Husky** - Git hooks for code quality
- **Turborepo** - Optimized monorepo build system
- **Changesets** - Versioning and publishing

## Quick Start

### Create a New Project

```bash
# Create a new Carve project
npx @matthew.atkins/create-carve create my-awesome-project

# Or with a specific name
npx @matthew.atkins/create-carve create my-awesome-project
```

The CLI will:
- Download the Carve template
- Rename all references from "carve" to your project name
- Create environment files
- Set up database (optional)
- Initialize git repository (optional)
- Provide clear next steps

### Manual Setup (if not using CLI)

If you prefer to set up manually:

#### 1. Install Dependencies
```bash
bun install
```

#### 2. Set Up Database with Docker

```bash
# Start the database
docker-compose up --build -d
```

#### 3. Set up environment variables

**Auth Server** (create `apps/auth-server/.env`)
```env
AUTH_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auth_db"
BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:3001"
CORS_ORIGIN="http://localhost:3000"
```

**API Server** (create `apps/api-server/.env`)
```env
API_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/api_db"
AUTH_SERVER_URL="http://localhost:3001"
CORS_ORIGIN="http://localhost:3000"
```

#### 4. Push database schemas
```bash
# Push auth schema
bun run db:push:auth

# Push API schema
bun run db:push:api
```

#### 5. Start All Services
```bash
bun dev
```

## Architecture Overview

This project uses a microservices architecture with three main services:

### Services

1. **Web App** (`apps/web/`) - Port 3000
   - Frontend UI that consumes both servers
   - Uses Better Auth client for authentication
   - Uses shared API client for business logic

2. **Auth Server** (`apps/auth-server/`) - Port 3001
   - Handles all authentication and authorization
   - Database: Auth-specific schema (users, sessions, accounts)
   - Endpoints: `/api/auth/**` (login, register, session management)
   - Validates Better Auth sessions for API server communication

3. **API Server** (`apps/api-server/`) - Port 3002
   - Handles all application logic and business data
   - Database: Application-specific schema
   - Endpoints: `/rpc/**` (all application endpoints)
   - Validates Better Auth sessions from auth server

### Shared Packages

- **`packages/api/`** - Shared oRPC router definitions and type-safe API procedures
- **`packages/shared-types/`** - Common TypeScript interfaces
- **`packages/shared-utils/`** - Shared utilities (session validation, database helpers)

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
- `bun run db:studio:auth` - Open auth database studio
- `bun run db:studio:api` - Open API database studio

## Testing the Setup

### Test Services
```bash
# Test Web App
curl http://localhost:3000/

# Test Auth Server
curl http://localhost:3001/

# Test API Server
curl http://localhost:3002/
```

### Test Authentication Flow
1. Open http://localhost:3000 in your browser
2. Try to sign up/sign in
3. Check that the web app communicates with both servers

## Database Management

### Start/Stop Database
```bash
# Start database
docker-compose up --build -d

# Stop database
docker-compose down

# Reset database (removes all data)
docker-compose down -v && docker-compose up --build -d
```

## Better Auth Session Architecture

This project uses Better Auth sessions for service-to-service authentication between the auth-server and api-server.

### Authentication Flow

1. **User Authentication**: Web app authenticates with auth server using Better Auth
2. **Session Validation**: API server validates Better Auth sessions with auth server
3. **API Access**: Web app uses session cookies to access protected API endpoints
4. **Session Verification**: API server verifies sessions with auth server

### Security Benefits

- **No Shared Database**: API server doesn't need direct access to auth database
- **Session Management**: Better Auth handles session lifecycle and security
- **Cookie-based Security**: Sessions are managed securely through HTTP cookies
- **Microservices Security**: Proper separation between auth and business logic

For detailed information, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Development Workflow

### Adding New API Endpoints
1. Edit `packages/api/src/router.ts`
2. Add your new procedures
3. The API server will automatically pick them up
4. The web app will have type-safe access

### Adding New Auth Features
1. Extend the auth server in `apps/auth-server/`
2. Update the shared types as needed
3. All clients benefit from the changes

### Adding New Frontends
1. Create new app in `apps/`
2. Install shared packages
3. Configure environment variables
4. Get type-safe access to all APIs

## Troubleshooting

### Common Issues

#### Database Connection Issues
- Check that PostgreSQL is running: `docker ps`
- Verify database URLs in environment variables
- Check database logs: `docker logs your-project-postgres`

#### CORS Issues
- Check that `CORS_ORIGIN` is set correctly
- Verify that web app URL matches CORS settings

#### Session Issues
- Check that auth server is running
- Verify that API server can reach auth server
- Check environment variables

#### Type Errors
```bash
# Check all types
bun run check-types

# Check specific service
cd apps/auth-server && bun run check-types
```

### Port Conflicts
If port 5432 is already in use:
```bash
# Stop existing PostgreSQL
brew services stop postgresql

# Or change the port in docker-compose.yml
ports:
  - "5433:5432"  # Use port 5433 instead
```

## Architecture Benefits

1. **Separation of Concerns**: Each service has a single responsibility
2. **Scalability**: Services can be scaled independently
3. **Security**: Auth server can be locked down separately
4. **Flexibility**: Easy to add new services or frontends
5. **Type Safety**: Shared packages ensure consistency
6. **Database Isolation**: Auth and app data are separate
7. **Better Auth Sessions**: Secure service-to-service communication

## Project Structure

```
your-project/
├── apps/
│   ├── web/              # Frontend application (Nuxt)
│   ├── auth-server/      # Authentication service (Hono + Better Auth)
│   └── api-server/       # Business logic service (Hono + ORPC)
├── packages/
│   ├── api/              # Shared API router and types
│   ├── shared-types/     # Common TypeScript interfaces
│   └── shared-utils/     # Shared utilities
├── docs/
│   └── ARCHITECTURE.md   # Architecture overview
```

## Next Steps

1. **Add your application schema** to `apps/api-server/src/db/schema/`
2. **Add API endpoints** to `packages/api/src/router.ts`
3. **Customize auth features** in `apps/auth-server/`
4. **Add more frontends** as needed
5. **Set up production deployment** for each service

## Documentation

- [System Architecture](./docs/ARCHITECTURE.md) - Detailed architecture implementation

## License

This project is free to use, clone, and share for non-commercial purposes.
You may not sell, modify, or use the source code for commercial projects.
See [LICENSE.txt](./LICENSE.txt) for details.
