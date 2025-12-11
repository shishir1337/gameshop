/**
 * Server Component version of Admin Users Page
 * This demonstrates SSR implementation with proper types
 */

import { Suspense } from "react";
import { getAdminUsers } from "@/app/actions/admin";
import { AdminUsersClient } from "./users-client";
import type { PageProps } from "@/types";

interface AdminUsersPageProps extends PageProps {
  searchParams?: {
    search?: string;
    page?: string;
  };
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const search = searchParams?.search || "";
  const page = parseInt(searchParams?.page || "1", 10);

  // Fetch data on the server
  const { users, pagination } = await getAdminUsers({
    search,
    page,
    limit: 50,
  });

  return (
    <Suspense fallback={<UsersLoadingSkeleton />}>
      <AdminUsersClient
        initialUsers={users}
        initialPagination={pagination}
        initialSearch={search}
      />
    </Suspense>
  );
}

function UsersLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-64 bg-muted animate-pulse rounded" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded mt-2" />
        </div>
      </div>
      <div className="border rounded-lg p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

