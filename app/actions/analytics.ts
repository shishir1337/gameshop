"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/utils/admin";

/**
 * Get analytics data for admin dashboard
 */
export async function getAnalytics() {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get date ranges
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total revenue
    const totalRevenue = await prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    });

    // Today's revenue
    const todayRevenue = await prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: todayStart },
      },
      _sum: { totalAmount: true },
    });

    // This month's revenue
    const thisMonthRevenue = await prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: thisMonthStart },
      },
      _sum: { totalAmount: true },
    });

    // Last month's revenue
    const lastMonthRevenue = await prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
      _sum: { totalAmount: true },
    });

    // Order counts
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING" },
    });
    const completedOrders = await prisma.order.count({
      where: { status: "COMPLETED" },
    });
    const paidOrders = await prisma.order.count({
      where: { paymentStatus: "PAID" },
    });

    // Today's orders
    const todayOrders = await prisma.order.count({
      where: { createdAt: { gte: todayStart } },
    });

    // This month's orders
    const thisMonthOrders = await prisma.order.count({
      where: { createdAt: { gte: thisMonthStart } },
    });

    // Product stats
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({
      where: { isActive: true },
    });

    // Top products by order count
    const topProducts = await prisma.product.findMany({
      take: 5,
      orderBy: {
        orders: {
          _count: "desc",
        },
      },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate revenue growth
    const revenueGrowth =
      lastMonthRevenue._sum.totalAmount && lastMonthRevenue._sum.totalAmount > 0
        ? ((thisMonthRevenue._sum.totalAmount || 0) -
            (lastMonthRevenue._sum.totalAmount || 0)) /
          lastMonthRevenue._sum.totalAmount
        : 0;

    return {
      success: true,
      data: {
        revenue: {
          total: totalRevenue._sum.totalAmount || 0,
          today: todayRevenue._sum.totalAmount || 0,
          thisMonth: thisMonthRevenue._sum.totalAmount || 0,
          lastMonth: lastMonthRevenue._sum.totalAmount || 0,
          growth: Math.round(revenueGrowth * 100),
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
          paid: paidOrders,
          today: todayOrders,
          thisMonth: thisMonthOrders,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
        },
        topProducts,
        recentOrders,
      },
    };
  } catch (error: unknown) {
    console.error("Get analytics error:", error);
    if (error instanceof Error && error.message === "Unauthorized: Admin access required") {
      return { success: false, error: "Unauthorized" };
    }
    return { success: false, error: "Failed to fetch analytics" };
  }
}

