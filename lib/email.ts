import { resend, DEFAULT_FROM_EMAIL } from "./resend";
import { render } from "@react-email/render";
import { PasswordResetTemplate } from "@/components/emails/password-reset-template";
import { WelcomeEmailTemplate } from "@/components/emails/welcome-email-template";
import { EmailVerificationTemplate } from "@/components/emails/email-verification-template";

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail({
  email,
  resetLink,
  firstName,
}: {
  email: string;
  resetLink: string;
  firstName?: string;
}) {
  try {
    const emailHtml = await render(PasswordResetTemplate({ resetLink, firstName }));
    
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: [email],
      subject: "Reset Your Password - GameShop",
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send password reset email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

/**
 * Send a welcome email to newly registered users
 */
export async function sendWelcomeEmail({
  email,
  firstName,
}: {
  email: string;
  firstName?: string;
}) {
  try {
    const emailHtml = await render(WelcomeEmailTemplate({ email, firstName }));
    
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: [email],
      subject: "Welcome to GameShop!",
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
      // Don't throw - welcome email failure shouldn't block registration
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw - welcome email failure shouldn't block registration
    return null;
  }
}

/**
 * Send an email verification email with OTP
 */
export async function sendVerificationEmail({
  email,
  otpCode,
  firstName,
}: {
  email: string;
  otpCode: string;
  firstName?: string;
}) {
  try {
    const emailHtml = await render(EmailVerificationTemplate({ otpCode, firstName }));
    
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: [email],
      subject: "Verify Your Email - GameShop",
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send verification email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

