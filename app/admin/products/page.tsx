import { ProductManagement } from "@/components/admin/product-management";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Product Management</h1>
        <p className="text-muted-foreground">
          Manage products, variants, and user form fields
        </p>
      </div>
      <ProductManagement />
    </div>
  );
}

