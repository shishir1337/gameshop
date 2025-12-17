import { OrderManagement } from "@/components/admin/order-management";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Order Management</h1>
        <p className="text-muted-foreground">
          View and manage all customer orders
        </p>
      </div>
      <OrderManagement />
    </div>
  );
}

