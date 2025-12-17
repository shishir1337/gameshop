import { Suspense } from "react";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { AnalyticsDashboardSkeleton } from "@/components/admin/analytics-dashboard-skeleton";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          View system analytics and reports
        </p>
      </div>
      <Suspense fallback={<AnalyticsDashboardSkeleton />}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  );
}

