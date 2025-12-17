import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Logout the current user
 */
export async function POST() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Logout failed";
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}

