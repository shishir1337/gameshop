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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Logout failed" },
      { status: 400 }
    );
  }
}

