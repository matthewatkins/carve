# JWT Token Architecture: Auth Server ↔ API Server

This document explains the JWT token system used for authentication between the auth-server and api-server in our microservices architecture.

## Overview

The JWT token system serves as a **bridge between microservices** for authentication, translating Better Auth sessions into a format suitable for service-to-service communication.

## Architecture Flow

### 1. User Authentication (Better Auth)
```
Web App → Auth Server → Better Auth → Auth Database
```
- User signs in via Better Auth
- Better Auth creates a session in the auth database
- Web app receives a session cookie

### 2. JWT Token Generation
```
Web App → Auth Server → /api/validate-session
```
- Web app calls auth server with session cookie
- Auth server validates the Better Auth session
- Auth server creates a JWT token containing user and session information

### 3. API Server Validation
```
Web App → API Server → Auth Server → /api/validate-jwt
```
- Web app sends JWT token to API server
- API server validates JWT locally (cryptographic verification)
- API server calls auth server to verify session still exists
- API server receives user context for business logic

## JWT Token Structure

```typescript
interface JWTPayload {
  userId: string;      // Links to user in auth database
  sessionId: string;   // Links to specific session
  exp: number;         // Expiration timestamp
  iat: number;         // Issued at timestamp
}
```

## Security Flow

1. **Token Creation**: Auth server creates JWT with user and session info
2. **Local Verification**: API server verifies JWT signature and expiration
3. **Session Validation**: API server calls auth server to ensure session still exists
4. **Business Logic**: API server uses validated user context for operations

## Why This Architecture is Useful

### 1. Microservices Security Pattern
This follows a common microservices pattern where:
- **Auth Server** = "Identity Provider"
- **API Server** = "Resource Server"
- **JWT Tokens** = "Access Tokens"

### 2. Separation of Concerns
- **Auth Server**: Handles user authentication, session management
- **API Server**: Handles business logic, data operations
- **JWT**: Provides stateless authentication between services

### 3. Security Benefits
- **No Shared Database**: API server doesn't need direct access to auth database
- **Session Validation**: JWT tokens are tied to specific sessions, so revoking a session invalidates all related JWT tokens
- **Cryptographic Verification**: API server can verify JWT signatures locally before making network calls

### 4. Performance Benefits
- **Reduced Database Load**: API server doesn't query auth database for every request
- **Caching**: JWT tokens can be cached and verified locally
- **Stateless**: API server doesn't need to maintain session state

### 5. Scalability Benefits
- **Independent Scaling**: Auth and API servers can scale independently
- **Load Distribution**: Authentication load is separated from business logic load
- **Deployment Flexibility**: Services can be deployed and updated independently

## Why Not Just Use Better Auth Sessions Directly?

Better Auth sessions are **cookie-based** and designed for **browser authentication**. The JWT tokens provide:

- **Service-to-Service Communication**: APIs can't easily use cookies
- **Mobile/Desktop Apps**: JWT tokens work better for non-browser clients
- **Microservices**: Stateless tokens work better in distributed systems
- **Flexibility**: JWT tokens can be used across different domains/services

## Real-World Analogy

Think of it like a **hotel key card system**:
- **Better Auth Session** = Your hotel room key (works at the hotel)
- **JWT Token** = A special access pass (works at hotel restaurants, gym, pool)
- **Auth Server** = Hotel front desk (issues both)
- **API Server** = Hotel services (validates your access pass)

## Implementation Details

### Auth Server Endpoints

#### `/api/validate-session`
- Validates Better Auth session
- Creates JWT token with user and session info
- Returns token for API server use

#### `/api/validate-jwt`
- Validates JWT token signature and expiration
- Verifies session still exists in database
- Returns user context for API server

### API Server Context Creation

```typescript
// apps/api-server/src/lib/context.ts
export async function createContext({ context }: CreateContextOptions): Promise<ApiContext> {
  const authHeader = context.request.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader || undefined);

  if (!token) {
    return { auth: null };
  }

  // Validate JWT token locally
  const payload = verifyJWT(token, process.env.JWT_SECRET || "fallback-secret");
  if (!payload) {
    return { auth: null };
  }

  // Call auth-server to validate session
  const response = await fetch(`${authServerUrl}/api/validate-jwt`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // Return user context if valid
  if (response.ok) {
    const result = await response.json();
    if (result.valid) {
      return { auth: { user: result.user, session: result.session } };
    }
  }

  return { auth: null };
}
```

### Web App Token Management

```typescript
// apps/web/app/plugins/orpc.ts
const apiClient = createApiClient({
  baseURL: apiServerUrl,
  getAuthToken: () => {
    // Get token from localStorage, cookies, or auth client
    return localStorage.getItem('auth-token') || null;
  }
});
```

## Security Considerations

1. **JWT Secret**: Must be shared between auth and API servers
2. **Token Expiration**: Tokens should have reasonable expiration times
3. **Session Revocation**: Sessions can be revoked, invalidating all related JWT tokens
4. **HTTPS**: All communication should use HTTPS in production
5. **CORS**: Proper CORS configuration for cross-origin requests

## Benefits Summary

The JWT token architecture essentially **translates Better Auth sessions into a format that works for service-to-service communication** while maintaining the security benefits of session-based authentication.

### Key Advantages:
- ✅ **Microservices Security**: Proper separation between auth and business logic
- ✅ **Performance**: Reduced database queries and network calls
- ✅ **Scalability**: Independent scaling of services
- ✅ **Flexibility**: Works with various client types (web, mobile, desktop)
- ✅ **Security**: Cryptographic verification with session validation
- ✅ **Maintainability**: Clear separation of concerns

This pattern is widely used in production systems and provides a robust foundation for microservices authentication.