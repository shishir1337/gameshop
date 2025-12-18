"use client";

import { useState, useEffect, useTransition, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/actions/category";
import type { Category } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";

type CategoryWithCount = Category & {
  _count: {
    products: number;
  };
};

export function CategoryManagement() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryWithCount[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    isActive: true,
  });

  const loadCategories = useCallback(async () => {
    startTransition(async () => {
      try {
        const result = await getCategories();
        if (result.success && result.data) {
          setCategories(result.data as CategoryWithCount[]);
        } else {
          toast.error(result.error || "Failed to load categories");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load categories"
        );
      }
    });
  }, []);

  // Filter categories based on search and status
  const filteredCategoriesMemo = useMemo(() => {
    let filtered = categories;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchLower) ||
          cat.slug.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (cat) => cat.isActive === (statusFilter === "active")
      );
    }

    return filtered;
  }, [categories, search, statusFilter]);

  useEffect(() => {
    setFilteredCategories(filteredCategoriesMemo);
  }, [filteredCategoriesMemo]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async () => {
    startTransition(async () => {
      try {
        const result = await createCategory(formData);
        if (result.success) {
          toast.success("Category created successfully");
          setIsCreateDialogOpen(false);
          resetForm();
          loadCategories();
        } else {
          toast.error(result.error || "Failed to create category");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create category"
        );
      }
    });
  };

  const handleEdit = (category: CategoryWithCount) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      isActive: category.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    startTransition(async () => {
      try {
        const result = await updateCategory(editingCategory.id, formData);
        if (result.success) {
          toast.success("Category updated successfully");
          setIsEditDialogOpen(false);
          setEditingCategory(null);
          resetForm();
          loadCategories();
        } else {
          toast.error(result.error || "Failed to update category");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update category"
        );
      }
    });
  };

  const handleDelete = async (categoryId: string) => {
    startTransition(async () => {
      try {
        const result = await deleteCategory(categoryId);
        if (result.success) {
          toast.success("Category deleted successfully");
          loadCategories();
        } else {
          toast.error(result.error || "Failed to delete category");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete category"
        );
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      isActive: true,
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name),
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>
                Manage product categories and their settings
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 size-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                  <DialogDescription>
                    Add a new product category to organize your products
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="create-name">Name *</Label>
                    <Input
                      id="create-name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Category name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="create-slug">Slug *</Label>
                    <Input
                      id="create-slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="category-slug"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="create-active">Status</Label>
                    <Select
                      value={formData.isActive ? "active" : "inactive"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          isActive: value === "active",
                        })
                      }
                    >
                      <SelectTrigger id="create-active">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isPending}>
                    Create Category
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categories Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending && filteredCategories.length === 0 && categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading categories...
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        {category.isActive ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="size-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="size-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(category.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{category.name}&quot;? This
                                  action cannot be undone. Categories with products cannot
                                  be deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Stats */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredCategories.length} of {categories.length} categories
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Category name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-slug">Slug *</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="category-slug"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-active">Status</Label>
              <Select
                value={formData.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    isActive: value === "active",
                  })
                }
              >
                <SelectTrigger id="edit-active">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingCategory(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isPending}>
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

