// Common types shared between auth-server and api-server

export interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Session {
	id: string;
	expiresAt: Date;
	token: string;
	createdAt: Date;
	updatedAt: Date;
	ipAddress?: string;
	userAgent?: string;
	userId: string;
	user?: User;
}

export interface AuthContext {
	user: User;
	session: Session;
}

export interface ApiContext {
	auth: AuthContext | null;
}

// Common error types
export interface ApiError {
	code: string;
	message: string;
	status: number;
}

// Database connection types
export interface DatabaseConfig {
	url: string;
	maxConnections?: number;
	ssl?: boolean;
}
