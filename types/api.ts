/**
 * API-specific types for request/response handling
 */

import type { AuthUser, AuthSessionData } from "./auth";

// ============================================================================
// Auth API Types
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  user: AuthUser;
  session?: AuthSessionData | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  session: AuthSessionData;
}

// ============================================================================
// User API Types
// ============================================================================

export interface UpdateProfileRequest {
  name?: string;
  image?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: AuthUser;
}

export interface UploadAvatarResponse {
  url: string;
  filename: string;
}

// ============================================================================
// Error Response Types
// ============================================================================

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
  retryAfter?: number;
}

export interface ValidationErrorResponse extends ErrorResponse {
  details: Array<{
    path: (string | number)[];
    message: string;
  }>;
}

