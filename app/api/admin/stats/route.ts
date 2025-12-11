import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sanitizeError } from "@/lib/utils/errors";

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
export async function GET(req: NextRequest) {
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
    const [totalUsers, totalProducts, totalOrders, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.product?.count().catch(() => 0) || Promise.resolve(0),
      prisma.order?.count().catch(() => 0) || Promise.resolve(0),
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

    // Calculate total revenue (if orders exist)
    let totalRevenue = 0;
    try {
      const orders = await prisma.order?.findMany({
        select: {
          total: true,
        },
      }).catch(() => []);
      
      if (orders && Array.isArray(orders)) {
        totalRevenue = orders.reduce((sum, order) => {
          const total = typeof order.total === 'number' ? order.total : parseFloat(order.total as any) || 0;
          return sum + total;
        }, 0);
      }
    } catch (error) {
      // Orders table might not exist yet
      totalRevenue = 0;
    }

    // Get recent orders (if orders exist)
    let recentOrders: any[] = [];
    try {
      recentOrders = await prisma.order?.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }).catch(() => []) || [];
    } catch (error) {
      // Orders table might not exist yet
      recentOrders = [];
    }

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

