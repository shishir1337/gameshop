import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email - should be a verified domain in Resend
// Format: "Display Name <email@domain.com>" or just "email@domain.com"
export const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "GameShop <onboarding@resend.dev>";

