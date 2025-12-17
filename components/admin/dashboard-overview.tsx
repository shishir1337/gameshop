"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, TrendingUp, ShoppingCart, DollarSign, Activity, RefreshCw, UserPlus, Settings, BarChart3, AlertCircle } from "lucide-react";
import { getDashboardStats } from "@/app/actions/admin";
import { getAnalytics } from "@/app/actions/analytics";
import type { DashboardStats, AnalyticsData } from "@/types/admin";
import Link from "next/link";

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orderStats, setOrderStats] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      const [statsResult, analyticsResult] = await Promise.all([
        getDashboardStats(),
        getAnalytics(),
      ]);

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      } else {
        setError(statsResult.error || "Failed to load dashboard statistics");
      }

      if (analyticsResult.success && analyticsResult.data) {
        setOrderStats(analyticsResult.data);
      } else {
        setError((prev) => prev || analyticsResult.error || "Failed to load analytics");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error && !stats && !orderStats) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button onClick={fetchData} variant="outline" size="sm" className="ml-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `৳${orderStats?.revenue.total.toLocaleString() || 0}`,
      description: "All time revenue",
      icon: DollarSign,
      trend: orderStats?.revenue.growth 
        ? `${orderStats.revenue.growth >= 0 ? "+" : ""}${orderStats.revenue.growth}%`
        : null,
      link: "/admin/analytics",
    },
    {
      title: "Total Orders",
      value: orderStats?.orders.total || 0,
      description: `${orderStats?.orders.paid || 0} paid orders`,
      icon: ShoppingCart,
      trend: null,
      link: "/admin/orders",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      description: "All registered users",
      icon: Users,
      trend: null,
      link: "/admin/users",
    },
    {
      title: "Pending Orders",
      value: orderStats?.orders.pending || 0,
      description: "Awaiting processing",
      icon: ShoppingCart,
      trend: null,
      link: "/admin/orders?status=PENDING",
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: UserPlus,
      link: "/admin/users",
    },
    {
      title: "View Analytics",
      description: "Detailed analytics and reports",
      icon: BarChart3,
      link: "/admin/analytics",
    },
    {
      title: "Settings",
      description: "Configure application settings",
      icon: Settings,
      link: "/admin/settings",
    },
  ];

  // Generate recent activity from analytics data
  const recentActivity = orderStats?.recentOrders.slice(0, 5).map((order) => ({
    id: order.id,
    type: "order_created" as const,
    message: `New order ${order.orderNumber} for ${order.product.name}`,
    timestamp: new Date(order.createdAt),
    link: `/admin/orders/${order.orderNumber}`,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard. Here&apos;s what&apos;s happening.
          </p>
        </div>
        <Button
          onClick={fetchData}
          variant="outline"
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          
          const cardContent = (
            <>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                {stat.trend !== null && stat.trend && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    {stat.trend.startsWith("-") ? (
                      <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                    ) : stat.trend.startsWith("+") ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )}
                    <span>{stat.trend} from last month</span>
                  </div>
                )}
              </CardContent>
            </>
          );
          
          return (
            <Card key={stat.title} className={stat.link ? "hover:shadow-md transition-shadow cursor-pointer" : ""}>
              {stat.link ? (
                <Link href={stat.link} className="block">
                  {cardContent}
                </Link>
              ) : (
                cardContent
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest orders and user activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">No recent activity</p>
                    <p className="text-xs text-muted-foreground">
                      Activity will appear here as orders are created
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <Link
                    key={activity.id}
                    href={activity.link || "#"}
                    className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.title} href={action.link}>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <div>
                        <Icon className="h-4 w-4 mr-2" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{action.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {action.description}
                          </span>
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
