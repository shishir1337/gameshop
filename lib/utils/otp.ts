import { randomInt } from "crypto";

/**
 * Generate a cryptographically secure 6-digit OTP code
 */
export function generateOTP(): string {
  // Generate a random number between 100000 and 999999
  const min = 100000;
  const max = 999999;
  const otp = randomInt(min, max + 1);
  return otp.toString().padStart(6, "0");
}

/**
 * Generate OTP with expiration time
 */
export function generateOTPWithExpiry(minutes: number = 15): {
  code: string;
  expiresAt: Date;
} {
  const code = generateOTP();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + minutes);

  return { code, expiresAt };
}

