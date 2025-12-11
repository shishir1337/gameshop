/**
 * API-specific types for request/response handling
 */

import { UserProfile, AdminUser, AdminStats } from "./index";

// ============================================================================
// Auth API Types
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  user: UserProfile;
  session?: {
    id: string;
    expiresAt: Date;
    token: string;
  } | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserProfile;
  session: {
    id: string;
    expiresAt: Date;
    token: string;
  };
}

export interface MeResponse {
  user: UserProfile;
  session?: {
    id: string;
    expiresAt: Date;
    token: string;
  };
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
  user: UserProfile;
}

export interface UploadAvatarResponse {
  url: string;
  filename: string;
}

// ============================================================================
// Admin API Types
// ============================================================================

export interface AdminUsersQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface AdminStatsResponse {
  stats: AdminStats;
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

