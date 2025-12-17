/**
 * Admin-specific types
 * Types for admin dashboard and user management
 */

// ============================================================================
// Admin User Types
// ============================================================================

/**
 * Admin user type with all admin-specific fields
 */
export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: boolean;
  role: string;
  banned: boolean;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Admin API Types
// ============================================================================

/**
 * Parameters for listing users in admin panel
 */
export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  emailVerified?: boolean;
}

/**
 * Response type for listing users
 */
export interface ListUsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Response type for user operations
 */
export interface UserOperationResponse {
  success: boolean;
  message: string;
}

/**
 * Parameters for banning a user
 */
export interface BanUserParams {
  userId: string;
  banReason?: string;
  banExpiresIn?: number; // seconds
}

/**
 * Parameters for updating user role
 */
export interface UpdateUserRoleParams {
  userId: string;
  role: "user" | "admin";
}

/**
 * Parameters for toggling email verification
 */
export interface ToggleEmailVerificationParams {
  userId: string;
  emailVerified: boolean;
}

// ============================================================================
// Dashboard Types
// ============================================================================

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  adminUsers: number;
  bannedUsers: number;
}

