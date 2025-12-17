/**
 * Form data types
 * Types for form inputs and validation
 */

// ============================================================================
// Auth Form Types
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
  confirmPassword?: string;
}

export interface VerifyEmailFormData {
  otp: string;
  email: string;
}

export interface ResendVerificationFormData {
  email: string;
}

// ============================================================================
// Profile Form Types
// ============================================================================

export interface UpdateProfileFormData {
  name?: string;
  image?: string;
}

