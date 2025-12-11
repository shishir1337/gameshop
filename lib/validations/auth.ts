import { z } from "zod";

/**
 * Authentication validation schemas
 */

export const registerSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be less than 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be less than 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const verifyEmailSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),
  image: z.string().url("Image must be a valid URL").optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

