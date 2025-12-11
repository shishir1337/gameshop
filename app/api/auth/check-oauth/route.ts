import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sanitizeError } from "@/lib/utils/errors";

/**
 * GET /api/auth/check-oauth
 * Check if the current user has OAuth accounts (Google/Facebook)
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { hasOAuthAccount: false },
        { status: 200 }
      );
    }

    // Check if user has OAuth accounts
    const oAuthAccounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
        providerId: {
          in: ["google", "facebook"],
        },
      },
    });

    return NextResponse.json({
      hasOAuthAccount: oAuthAccounts.length > 0,
    });
  } catch (error: unknown) {
    const { message, statusCode } = sanitizeError(error);
    return NextResponse.json(
      { hasOAuthAccount: false, error: message },
      { status: statusCode }
    );
  }
}

