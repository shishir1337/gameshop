import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Menu } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Check if user has admin permissions
  try {
    const hasPermission = await auth.api.userHasPermission({
      body: {
        permission: {
          user: ["list"],
        },
      },
      headers: await headers(),
    });

    if (!hasPermission) {
      redirect("/");
    }
  } catch {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1">
          <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger>
              <Menu className="size-5" />
            </SidebarTrigger>
            <div className="flex-1" />
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

