import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/reset-password
 * Reset password with token
 * This forwards to Better Auth's reset-password endpoint
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Forward to Better Auth's reset-password endpoint
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to reset password" },
      { status: 400 }
    );
  }
}

