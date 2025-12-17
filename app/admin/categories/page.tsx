import { CategoryManagement } from "@/components/admin/category-management";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Category Management</h1>
        <p className="text-muted-foreground">
          Manage product categories and organize your products
        </p>
      </div>
      <CategoryManagement />
    </div>
  );
}
