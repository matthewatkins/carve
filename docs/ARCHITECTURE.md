# Split Architecture: Auth Server + API Server

This project has been refactored to use a microservices architecture with separate auth-server and api-server applications, each with their own database.

## Architecture Overview

### Services

1. **Auth Server** (`apps/auth-server/`)
   - **Port**: 3001
   - **Database**: Auth database (users, sessions, accounts, verifications)
   - **Responsibilities**: User authentication, session management, session validation
- **Endpoints**: `/api/auth/*`, `/api/validate-session`

2. **API Server** (`apps/api-server/`)
   - **Port**: 3002
   - **Database**: API database (business entities: projects, tasks, comments)
   - **Responsibilities**: Business logic, protected RPC endpoints
   - **Endpoints**: `/rpc*`

3. **Web App** (`apps/web/`)
   - **Port**: 3000
   - **Responsibilities**: Frontend UI, connects to both auth and api servers

### Shared Packages

- **`packages/shared-types/`**: Common TypeScript interfaces
- **`packages/shared-utils/`**: Shared utilities (session validation, database helpers)

## Database Separation

### Auth Database
- Users, sessions, accounts, verifications
- Managed by Better Auth
- Contains authentication and authorization data

### API Database
- Business entities (projects, tasks, comments)
- Contains application-specific data
- References user IDs from auth database (no foreign key constraints)

## Communication Flow

1. **User Authentication**:
   ```
   Web App → Auth Server → Auth Database
   ```

2. **Business Logic**:
   ```
   Web App → API Server → API Database
   API Server → Auth Server (for session validation)
   ```

3. **Session Validation**:
   ```
   API Server → Auth Server → Auth Database
   ```

## Environment Variables

### Auth Server
```env
AUTH_DATABASE_URL=postgresql://user:pass@localhost:5432/auth_db
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000
```

### API Server
```env
API_DATABASE_URL=postgresql://user:pass@localhost:5432/api_db
AUTH_SERVER_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000
```

## Development Commands

```bash
# Start all services
bun run dev

# Start individual services
bun run dev:auth-server
bun run dev:api-server
bun run dev:web

# Database operations
bun run db:push:auth
bun run db:studio:auth
bun run db:push:api
bun run db:studio:api
```

## Benefits

1. **Separation of Concerns**: Clear boundaries between auth and business logic
2. **Independent Scaling**: Scale auth and API servers separately
3. **Security Isolation**: Auth server can be more heavily secured
4. **Database Isolation**: Each service owns its data
5. **Technology Flexibility**: Different tech stacks for different concerns
6. **Deployment Flexibility**: Deploy services independently

## Migration from Monolithic Server

The original `apps/server/` can be removed after:
1. Auth server is tested and working
2. API server is tested and working
3. Web app is updated to connect to both servers
4. Database migration is complete

## Security Considerations

- Better Auth sessions are used for service-to-service authentication
- Auth server validates sessions before allowing API access
- API server validates sessions with auth server
- No direct database access between services
- CORS is configured for each service independently