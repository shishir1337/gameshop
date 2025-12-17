"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { getAnalytics } from "@/app/actions/analytics";
import Link from "next/link";

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await getAnalytics();
        if (result.success && result.data) {
          setAnalytics(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Failed to load analytics</p>
        </CardContent>
      </Card>
    );
  }

  const revenueCards = [
    {
      title: "Total Revenue",
      value: `৳${analytics.revenue.total.toLocaleString()}`,
      description: "All time",
      icon: DollarSign,
      trend: null,
    },
    {
      title: "Today&apos;s Revenue",
      value: `৳${analytics.revenue.today.toLocaleString()}`,
      description: "Revenue today",
      icon: DollarSign,
      trend: null,
    },
    {
      title: "This Month",
      value: `৳${analytics.revenue.thisMonth.toLocaleString()}`,
      description: `${
        analytics.revenue.growth >= 0 ? "+" : ""
      }${analytics.revenue.growth}% from last month`,
      icon: DollarSign,
      trend: analytics.revenue.growth >= 0 ? "up" : "down",
    },
    {
      title: "Total Orders",
      value: analytics.orders.total.toLocaleString(),
      description: `${analytics.orders.paid} paid orders`,
      icon: ShoppingCart,
      trend: null,
    },
  ];

  const orderCards = [
    {
      title: "Pending Orders",
      value: analytics.orders.pending,
      description: "Awaiting processing",
    },
    {
      title: "Completed Orders",
      value: analytics.orders.completed,
      description: "Successfully fulfilled",
    },
    {
      title: "Today&apos;s Orders",
      value: analytics.orders.today,
      description: "Orders placed today",
    },
    {
      title: "This Month",
      value: analytics.orders.thisMonth,
      description: "Orders this month",
    },
  ];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {revenueCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  {card.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {card.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                  <span>{card.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {orderCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-2">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Most ordered products</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No products ordered yet
              </p>
            ) : (
              <div className="space-y-4">
                {analytics.topProducts.map((product: any, index: number) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product._count.orders} order{product._count.orders !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest 10 orders</CardDescription>
              </div>
              <Link href="/admin/orders">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {analytics.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No orders yet
              </p>
            ) : (
              <div className="space-y-3">
                {analytics.recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{order.orderNumber}</span>
                        <Badge
                          variant={
                            order.paymentStatus === "PAID" ? "default" : "secondary"
                          }
                        >
                          {order.paymentStatus}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {order.product.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">৳{order.totalAmount}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

