import { Suspense } from "react";
import { DashboardOverview } from "@/components/admin/dashboard-overview";
import { DashboardOverviewSkeleton } from "@/components/admin/dashboard-overview-skeleton";

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardOverviewSkeleton />}>
      <DashboardOverview />
    </Suspense>
  );
}

