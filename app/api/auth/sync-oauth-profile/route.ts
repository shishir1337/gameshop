import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sanitizeError } from "@/lib/utils/errors";

/**
 * POST /api/auth/sync-oauth-profile
 * Sync user profile from OAuth provider (Google/Facebook)
 * This ensures profile image and name are up to date after OAuth login
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user's OAuth accounts
    const oAuthAccounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
        providerId: {
          in: ["google", "facebook"],
        },
      },
    });

    if (oAuthAccounts.length === 0) {
      return NextResponse.json({
        message: "No OAuth accounts found",
        updated: false,
      });
    }

    // Get the most recent OAuth account
    const latestAccount = oAuthAccounts.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )[0];

    // Fetch fresh profile data from OAuth provider
    let profileData: { name?: string; image?: string } = {};

    try {
      if (latestAccount.providerId === "google" && latestAccount.accessToken) {
        // Fetch Google profile
        const googleResponse = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${latestAccount.accessToken}`,
            },
          }
        );

        if (googleResponse.ok) {
          const googleProfile = await googleResponse.json();
          profileData = {
            name: googleProfile.name,
            image: googleProfile.picture,
          };
        }
      } else if (
        latestAccount.providerId === "facebook" &&
        latestAccount.accessToken
      ) {
        // Fetch Facebook profile
        const facebookResponse = await fetch(
          `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${latestAccount.accessToken}`
        );

        if (facebookResponse.ok) {
          const facebookProfile = await facebookResponse.json();
          profileData = {
            name: facebookProfile.name,
            image: facebookProfile.picture?.data?.url || null,
          };
        }
      }
    } catch (error) {
      // If fetching profile fails, that's okay - we'll just skip the update
      console.error("Failed to fetch OAuth profile:", error);
    }

    // Update user profile if we got new data
    if (profileData.name || profileData.image) {
      const updateData: { name?: string; image?: string } = {};
      if (profileData.name) updateData.name = profileData.name;
      if (profileData.image) updateData.image = profileData.image;

      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
      });

      return NextResponse.json({
        message: "Profile synced successfully",
        updated: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          image: updatedUser.image,
        },
      });
    }

    return NextResponse.json({
      message: "No profile updates needed",
      updated: false,
    });
  } catch (error: unknown) {
    const { message, statusCode } = sanitizeError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

