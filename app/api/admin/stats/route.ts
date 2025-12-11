import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sanitizeError } from "@/lib/utils/errors";

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
export async function GET() {
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || (user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Fetch statistics
    // Note: Product and Order models don't exist yet in schema
    // These will be implemented when those features are added
    const [totalUsers, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      }),
    ]);

    // Placeholder values until Product and Order models are added
    const totalProducts = 0;
    const totalOrders = 0;
    const totalRevenue = 0;
    const recentOrders: Array<{
      id: string;
      total: number | string;
      createdAt: Date;
      user?: {
        id: string;
        name: string | null;
        email: string;
      };
    }> = [];

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        recentUsers,
        recentOrders,
      },
    });
  } catch (error: unknown) {
    const { message, statusCode } = sanitizeError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

