/**
 * Centralized TypeScript type definitions
 * 
 * This is the main entry point for all types in the application.
 * Types are organized into separate files for better maintainability:
 * 
 * - types/auth.ts - Better Auth inferred types and auth-related types
 * - types/admin.ts - Admin dashboard and user management types
 * - types/api.ts - API request/response types
 * - types/components.ts - Component prop types
 * - types/database.ts - Database and Prisma types
 * - types/forms.ts - Form data types
 * - types/index.ts - Main export file (this file)
 */

// ============================================================================
// Re-export all types from organized modules
// ============================================================================

// Auth types (Better Auth inferred + legacy)
export type {
  AuthSession,
  AuthUser,
  AuthSessionData,
  ClientSession,
  ClientUser,
  ClientSessionData,
  UserProfile,
  SessionUser,
  LegacyAuthSession,
  AuthResponse,
  MeResponse,
} from "./auth";

// Admin types
export type {
  AdminUser,
  ListUsersParams,
  ListUsersResponse,
  UserOperationResponse,
  BanUserParams,
  UpdateUserRoleParams,
  ToggleEmailVerificationParams,
  DashboardStats,
} from "./admin";

// API types
export type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UploadAvatarResponse,
  ErrorResponse,
  ValidationErrorResponse,
} from "./api";

// Component types
export type {
  EmailTemplateProps,
  EmailVerificationTemplateProps,
  PasswordResetTemplateProps,
  WelcomeEmailTemplateProps,
  EmailVerificationDialogProps,
  SocialLoginButtonsProps,
  PageProps,
  LayoutProps,
  PasswordInputProps,
} from "./components";

// Database types
export type {
  UserWithAccounts,
  UserWithSessions,
  UserWithVerifications,
  UserFull,
  AccountWithUser,
  SessionWithUser,
  VerificationWithUser,
} from "./database";

// Form types
export type {
  RegisterFormData,
  LoginFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  VerifyEmailFormData,
  ResendVerificationFormData,
  UpdateProfileFormData,
} from "./forms";

// ============================================================================
// Common Types
// ============================================================================

import type { User, Account, Session, Verification } from "@prisma/client";

/**
 * Re-export Prisma types for convenience
 */
export type { User, Account, Session, Verification };

/**
 * User with all relations
 */
export type UserWithRelations = User & {
  accounts?: Account[];
  sessions?: Session[];
  verifications?: Verification[];
};

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response
 */
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

/**
 * Application error type
 */
export interface AppError {
  message: string;
  statusCode: number;
  code?: string;
}

/**
 * Profile update data
 */
export interface UpdateProfileData {
  name?: string;
  image?: string;
}

