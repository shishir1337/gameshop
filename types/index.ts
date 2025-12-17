/**
 * Centralized TypeScript type definitions
 * All types should be exported from here for better maintainability
 */

import { User, Account, Session, Verification } from "@prisma/client";

// ============================================================================
// Database Types (from Prisma)
// ============================================================================

export type { User, Account, Session, Verification };

export type UserWithRelations = User & {
  accounts?: Account[];
  sessions?: Session[];
  verifications?: Verification[];
};

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================================================
// Auth Types
// ============================================================================

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
  role: string;
}

export interface AuthSession {
  user: SessionUser;
  session: {
    id: string;
    expiresAt: Date;
    token: string;
  };
}

export interface AuthResponse {
  user: SessionUser;
  session?: AuthSession["session"];
}

// ============================================================================
// User Types
// ============================================================================

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  name?: string;
  image?: string;
}

// ============================================================================
// Form Types
// ============================================================================

export interface RegisterFormData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
}

export interface VerifyEmailFormData {
  otp: string;
  email: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface AppError {
  message: string;
  statusCode: number;
  code?: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface PageProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[] | undefined>;
}

export interface LayoutProps {
  children: React.ReactNode;
  params?: Record<string, string>;
}

