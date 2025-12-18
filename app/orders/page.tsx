import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserOrders } from "@/app/actions/order";
import { OrderHistory } from "@/components/orders/order-history";

export default async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?redirect=/orders");
  }

  const ordersResult = await getUserOrders();

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">
              My Orders
            </h1>
            <p className="mt-2 text-muted-foreground">
              View and track all your orders
            </p>
          </div>

          <OrderHistory
            orders={
              ordersResult.success && ordersResult.data
                ? ordersResult.data
                : []
            }
          />
        </div>
      </main>
    </div>
  );
}

