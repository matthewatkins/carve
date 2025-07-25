import type { ApiError, AuthContext, Session, User } from "@carve/shared-types";

// Database utilities
export function createDatabaseUrl(config: {
	host: string;
	port: number;
	database: string;
	username: string;
	password: string;
	ssl?: boolean;
}): string {
	const { host, port, database, username, password, ssl = false } = config;
	const sslParam = ssl ? "?sslmode=require" : "";
	return `postgresql://${username}:${password}@${host}:${port}/${database}${sslParam}`;
}

// Error utilities
export function createApiError(code: string, message: string, status = 400) {
	return { code, message, status };
}

export function isApiError(error: unknown): error is ApiError {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		"message" in error &&
		"status" in error
	);
}

// Auth context utilities
export function createAuthContext(user: User, session: Session): AuthContext {
	return {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			emailVerified: user.emailVerified,
			image: user.image,
			createdAt: new Date(user.createdAt),
			updatedAt: new Date(user.updatedAt),
		},
		session: {
			id: session.id,
			expiresAt: new Date(session.expiresAt),
			token: session.token,
			createdAt: new Date(session.createdAt),
			updatedAt: new Date(session.updatedAt),
			ipAddress: session.ipAddress,
			userAgent: session.userAgent,
			userId: session.userId,
		},
	};
}
