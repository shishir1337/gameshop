/**
 * Component-specific types
 * Types for React components and their props
 */

import type { ReactNode } from "react";

// ============================================================================
// Email Template Types
// ============================================================================

export interface EmailTemplateProps {
  firstName: string;
}

export interface EmailVerificationTemplateProps {
  firstName?: string;
  otpCode: string;
}

export interface PasswordResetTemplateProps {
  resetLink: string;
  firstName?: string;
}

export interface WelcomeEmailTemplateProps {
  firstName?: string;
  email: string;
}

// ============================================================================
// Auth Component Types
// ============================================================================

export interface EmailVerificationDialogProps {
  email: string;
  open: boolean;
  onVerified: () => void;
}

export interface SocialLoginButtonsProps {
  callbackURL?: string;
  mode?: "login" | "register";
}

// ============================================================================
// Layout Component Types
// ============================================================================

export interface PageProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[] | undefined>;
}

export interface LayoutProps {
  children: ReactNode;
  params?: Record<string, string>;
}

// ============================================================================
// UI Component Types
// ============================================================================

export type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

