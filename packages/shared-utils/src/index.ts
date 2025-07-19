import type {
	ApiError,
	AuthContext,
	JWTPayload,
	Session,
	User,
} from "@carve/shared-types";

// JWT utilities (placeholder - will be implemented with actual JWT library)
export function createJWT(
	payload: Omit<JWTPayload, "exp" | "iat">,
	secret: string,
	_expiresIn = "7d",
) {
	// This is a placeholder - in a real implementation, you'd use a JWT library
	const header = { alg: "HS256", typ: "JWT" };
	const now = Math.floor(Date.now() / 1000);
	const exp = now + 7 * 24 * 60 * 60; // 7 days

	const payloadWithTimestamps = {
		...payload,
		iat: now,
		exp: exp,
	};

	// Simple base64 encoding (NOT for production - use proper JWT library)
	const headerB64 = btoa(JSON.stringify(header));
	const payloadB64 = btoa(JSON.stringify(payloadWithTimestamps));

	return `${headerB64}.${payloadB64}.${btoa(secret)}`;
}

export function verifyJWT(token: string, _secret: string): JWTPayload | null {
	try {
		// This is a placeholder - in a real implementation, you'd use a JWT library
		const parts = token.split(".");
		if (parts.length !== 3) return null;

		const payloadB64 = parts[1];
		const payload = JSON.parse(atob(payloadB64));

		// Check expiration
		const now = Math.floor(Date.now() / 1000);
		if (payload.exp && payload.exp < now) return null;

		return payload as JWTPayload;
	} catch {
		return null;
	}
}

export function extractTokenFromHeader(authHeader?: string): string | null {
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return null;
	}
	return authHeader.substring(7);
}

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
