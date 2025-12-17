/**
 * Better Auth TypeScript Types
 * 
 * These types are inferred from the Better Auth configuration
 * to ensure type safety across the application.
 */

import type { auth } from "@/lib/auth";
import type { authClient } from "@/lib/auth-client";

// ============================================================================
// Better Auth Inferred Types (Server)
// ============================================================================

/**
 * Session type inferred from Better Auth server configuration
 * Includes both user and session properties
 */
export type AuthSession = typeof auth.$Infer.Session;

/**
 * User type inferred from Better Auth server configuration
 * This includes all additional fields defined in the auth config
 */
export type AuthUser = typeof auth.$Infer.Session.user;

/**
 * Session object type inferred from Better Auth server configuration
 */
export type AuthSessionData = typeof auth.$Infer.Session.session;

// ============================================================================
// Better Auth Inferred Types (Client)
// ============================================================================

/**
 * Client-side session type inferred from Better Auth client configuration
 */
export type ClientSession = typeof authClient.$Infer.Session;

/**
 * Client-side user type inferred from Better Auth client configuration
 */
export type ClientUser = typeof authClient.$Infer.Session.user;

/**
 * Client-side session object type inferred from Better Auth client configuration
 */
export type ClientSessionData = typeof authClient.$Infer.Session.session;

// ============================================================================
// Legacy Types (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use AuthUser instead
 * Legacy user profile type - kept for backward compatibility
 */
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: boolean;
  role: string;
  banned?: boolean;
  banReason?: string | null;
  banExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @deprecated Use AuthSession instead
 * Legacy session type - kept for backward compatibility
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
  role: string;
}

/**
 * @deprecated Use AuthSession instead
 * Legacy auth session type - kept for backward compatibility
 */
export interface LegacyAuthSession {
  user: SessionUser;
  session: {
    id: string;
    expiresAt: Date;
    token: string;
  };
}

// ============================================================================
// Auth Response Types
// ============================================================================

export interface AuthResponse {
  user: AuthUser;
  session?: AuthSessionData | null;
}

export interface MeResponse {
  user: AuthUser;
  session?: AuthSessionData;
  hasOAuthAccount?: boolean;
}

