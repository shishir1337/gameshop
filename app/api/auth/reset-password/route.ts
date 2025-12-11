import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { sanitizeError } from "@/lib/utils/errors";

/**
 * POST /api/auth/reset-password
 * Reset password with token
 * This forwards to Better Auth's reset-password endpoint
 */
export async function POST(req: NextRequest) {
  try {
    // Validate input
    const body = await req.json();
    const validationResult = resetPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: validationResult.error.issues[0]?.message || "Invalid input",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { token, password } = validationResult.data;

    // Forward to Better Auth's reset-password endpoint
    const baseUrl = process.env.BETTER_AUTH_URL;
    if (!baseUrl) {
      throw new Error("BETTER_AUTH_URL is not configured");
    }

    const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        token,
        newPassword: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error: unknown) {
    const { message, statusCode } = sanitizeError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

