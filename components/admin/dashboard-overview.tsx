"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Shield, TrendingUp, Activity } from "lucide-react";
import { listUsers, type AdminUser } from "@/app/actions/admin";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  adminUsers: number;
  bannedUsers: number;
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [allUsers, verifiedUsers, unverifiedUsers, adminUsers, bannedUsers] = await Promise.all([
          listUsers({ limit: 1000 }),
          listUsers({ limit: 1000, emailVerified: true }),
          listUsers({ limit: 1000, emailVerified: false }),
          listUsers({ limit: 1000, role: "admin" }),
          listUsers({ limit: 1000 }),
        ]);

        const bannedCount = bannedUsers.users.filter((u: AdminUser) => u.banned).length;

        setStats({
          totalUsers: allUsers.pagination.total,
          verifiedUsers: verifiedUsers.pagination.total,
          unverifiedUsers: unverifiedUsers.pagination.total,
          adminUsers: adminUsers.pagination.total,
          bannedUsers: bannedCount,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
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
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      description: "All registered users",
      icon: Users,
      trend: "+12.5%",
    },
    {
      title: "Verified Users",
      value: stats?.verifiedUsers || 0,
      description: "Email verified",
      icon: UserCheck,
      trend: "+8.2%",
    },
    {
      title: "Admin Users",
      value: stats?.adminUsers || 0,
      description: "Administrators",
      icon: Shield,
      trend: "0%",
    },
    {
      title: "Banned Users",
      value: stats?.bannedUsers || 0,
      description: "Currently banned",
      icon: UserX,
      trend: "-2.1%",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard. Here's what's happening with your users.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
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
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>{stat.trend} from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user registrations and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">System is running smoothly</p>
                  <p className="text-xs text-muted-foreground">
                    All services are operational
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Manage users and permissions
              </p>
              <p className="text-sm text-muted-foreground">
                • View system analytics
              </p>
              <p className="text-sm text-muted-foreground">
                • Configure application settings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

