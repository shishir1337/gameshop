"use client";

import { useState, useEffect, useTransition, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/app/actions/product";
import { getCategories } from "@/app/actions/category";
import type { Product, Category } from "@prisma/client";
import type { ProductFormData, UserFormField, ProductVariantFormData } from "@/lib/validations/product";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Search, Plus, Edit, Trash2, CheckCircle2, XCircle, X, PlusCircle } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

type ProductWithRelations = Product & {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  variants: Array<{
    id: string;
    name: string;
    price: number;
    isActive: boolean;
    sortOrder: number;
  }>;
  _count?: {
    orders: number;
  };
};

export function ProductManagement() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithRelations[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);

  // Form states
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    image: "",
    categoryId: "",
    isActive: true,
    userFormFields: [],
    variants: [],
  });

  const loadProducts = useCallback(async () => {
    startTransition(async () => {
      try {
        const result = await getProducts();
        if (result.success && result.data) {
          setProducts(result.data as ProductWithRelations[]);
        } else {
          toast.error(result.error || "Failed to load products");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load products"
        );
      }
    });
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const result = await getCategories();
      if (result.success && result.data) {
        setCategories(result.data as Category[]);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }, []);

  // Filter products
  const filteredProductsMemo = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (prod) =>
          prod.name.toLowerCase().includes(searchLower) ||
          prod.slug.toLowerCase().includes(searchLower) ||
          (prod.description?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (prod) => prod.isActive === (statusFilter === "active")
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((prod) => prod.categoryId === categoryFilter);
    }

    return filtered;
  }, [products, search, statusFilter, categoryFilter]);

  useEffect(() => {
    setFilteredProducts(filteredProductsMemo);
  }, [filteredProductsMemo]);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (formData.variants.length === 0) {
      toast.error("Please add at least one variant");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createProduct(formData);
        if (result.success) {
          toast.success("Product created successfully");
          setIsCreateDialogOpen(false);
          resetForm();
          loadProducts();
        } else {
          toast.error(result.error || "Failed to create product");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create product"
        );
      }
    });
  };

  const handleEdit = (product: ProductWithRelations) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      image: product.image || "",
      categoryId: product.categoryId,
      isActive: product.isActive,
      userFormFields: (product.userFormFields as UserFormField[]) || [],
      variants: product.variants.map((v) => ({
        name: v.name,
        price: v.price,
        isActive: v.isActive,
        sortOrder: v.sortOrder,
      })),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (formData.variants.length === 0) {
      toast.error("Please add at least one variant");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateProduct(editingProduct.id, formData);
        if (result.success) {
          toast.success("Product updated successfully");
          setIsEditDialogOpen(false);
          setEditingProduct(null);
          resetForm();
          loadProducts();
        } else {
          toast.error(result.error || "Failed to update product");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update product"
        );
      }
    });
  };

  const handleDelete = async (productId: string) => {
    startTransition(async () => {
      try {
        const result = await deleteProduct(productId);
        if (result.success) {
          toast.success("Product deleted successfully");
          loadProducts();
        } else {
          toast.error(result.error || "Failed to delete product");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete product"
        );
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      categoryId: "",
      isActive: true,
      userFormFields: [],
      variants: [],
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

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          name: "",
          price: 0,
          isActive: true,
          sortOrder: formData.variants.length,
        },
      ],
    });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const updateVariant = (index: number, field: keyof ProductVariantFormData, value: string | number | boolean) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const addFormField = () => {
    setFormData({
      ...formData,
      userFormFields: [
        ...(formData.userFormFields || []),
        {
          type: "text",
          name: "",
          label: "",
          placeholder: "",
          required: true,
        },
      ],
    });
  };

  const removeFormField = (index: number) => {
    setFormData({
      ...formData,
      userFormFields: formData.userFormFields?.filter((_, i) => i !== index) || [],
    });
  };

  const updateFormField = (index: number, field: keyof UserFormField, value: string | boolean | string[] | undefined) => {
    const newFields = [...(formData.userFormFields || [])];
    newFields[index] = { ...newFields[index], [field]: value };
    setFormData({ ...formData, userFormFields: newFields });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                Manage products, variants, and user form fields
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 size-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Product</DialogTitle>
                  <DialogDescription>
                    Add a new product with variants and user form fields
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  {/* Basic Info */}
                  <div className="grid gap-4">
                    <h3 className="font-semibold">Basic Information</h3>
                    <div className="grid gap-2">
                      <Label htmlFor="create-name">Name *</Label>
                      <Input
                        id="create-name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Product name"
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
                        placeholder="product-slug"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="create-description">Description</Label>
                      <Textarea
                        id="create-description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Product description"
                        rows={3}
                      />
                    </div>
                    <ImageUpload
                      value={formData.image}
                      onChange={(url) =>
                        setFormData({ ...formData, image: url })
                      }
                      folder="products"
                      label="Product Image"
                    />
                    <div className="grid gap-2">
                      <Label htmlFor="create-category">Category *</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, categoryId: value })
                        }
                      >
                        <SelectTrigger id="create-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

                  {/* Variants */}
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Variants *</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addVariant}
                      >
                        <PlusCircle className="mr-2 size-4" />
                        Add Variant
                      </Button>
                    </div>
                    {formData.variants.map((variant, index) => (
                      <div
                        key={index}
                        className="grid gap-2 rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Variant {index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariant(index)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="grid gap-2">
                            <Label>Name *</Label>
                            <Input
                              value={variant.name}
                              onChange={(e) =>
                                updateVariant(index, "name", e.target.value)
                              }
                              placeholder="e.g., 475 VP"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Price (BDT) *</Label>
                            <Input
                              type="number"
                              value={variant.price || ""}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "price",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder="525"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {formData.variants.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No variants added. Click &quot;Add Variant&quot; to add one.
                      </p>
                    )}
                  </div>

                  {/* User Form Fields */}
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">User Form Fields (Optional)</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addFormField}
                      >
                        <PlusCircle className="mr-2 size-4" />
                        Add Field
                      </Button>
                    </div>
                    {formData.userFormFields?.map((field, index) => (
                      <div
                        key={index}
                        className="grid gap-2 rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Field {index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFormField(index)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                        <div className="grid gap-2">
                          <Label>Field Type *</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value: "text" | "select") =>
                              updateFormField(index, "type", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text Input</SelectItem>
                              <SelectItem value="select">Dropdown</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="grid gap-2">
                            <Label>Field Name *</Label>
                            <Input
                              value={field.name}
                              onChange={(e) =>
                                updateFormField(index, "name", e.target.value)
                              }
                              placeholder="e.g., riotId"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Label *</Label>
                            <Input
                              value={field.label}
                              onChange={(e) =>
                                updateFormField(index, "label", e.target.value)
                              }
                              placeholder="e.g., Riot ID"
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Placeholder</Label>
                          <Input
                            value={field.placeholder || ""}
                            onChange={(e) =>
                              updateFormField(index, "placeholder", e.target.value)
                            }
                            placeholder="e.g., Please Input your Riot id"
                          />
                        </div>
                        {field.type === "select" && (
                          <div className="grid gap-2">
                            <Label>Options (comma-separated) *</Label>
                            <Input
                              value={
                                field.options?.join(", ") || ""
                              }
                              onChange={(e) =>
                                updateFormField(
                                  index,
                                  "options",
                                  e.target.value
                                    .split(",")
                                    .map((opt) => opt.trim())
                                    .filter(Boolean)
                                )
                              }
                              placeholder="e.g., Europe, America, Asia"
                            />
                          </div>
                        )}
                      </div>
                    ))}
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
                    Create Product
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
                placeholder="Search products..."
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending && filteredProducts.length === 0 && products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.category.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {product.variants.length} variant
                          {product.variants.length !== 1 ? "s" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.isActive ? (
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
                        {new Date(product.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
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
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{product.name}&quot;? This
                                  action cannot be undone. Products with orders cannot
                                  be deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product.id)}
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
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog - Similar structure to Create */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information, variants, and form fields
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Same form structure as create */}
            <div className="grid gap-4">
              <h3 className="font-semibold">Basic Information</h3>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Product name"
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
                  placeholder="product-slug"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Product description"
                  rows={3}
                />
              </div>
              <ImageUpload
                value={formData.image}
                onChange={(url) =>
                  setFormData({ ...formData, image: url })
                }
                folder="products"
                label="Product Image"
              />
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            {/* Variants */}
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Variants *</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                >
                  <PlusCircle className="mr-2 size-4" />
                  Add Variant
                </Button>
              </div>
              {formData.variants.map((variant, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Variant {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariant(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label>Name *</Label>
                      <Input
                        value={variant.name}
                        onChange={(e) =>
                          updateVariant(index, "name", e.target.value)
                        }
                        placeholder="e.g., 475 VP"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Price (BDT) *</Label>
                      <Input
                        type="number"
                        value={variant.price || ""}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "price",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="525"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {formData.variants.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No variants added. Click &quot;Add Variant&quot; to add one.
                </p>
              )}
            </div>

            {/* User Form Fields */}
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">User Form Fields (Optional)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFormField}
                >
                  <PlusCircle className="mr-2 size-4" />
                  Add Field
                </Button>
              </div>
              {formData.userFormFields?.map((field, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Field {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFormField(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <div className="grid gap-2">
                    <Label>Field Type *</Label>
                    <Select
                      value={field.type}
                      onValueChange={(value: "text" | "select") =>
                        updateFormField(index, "type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Input</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label>Field Name *</Label>
                      <Input
                        value={field.name}
                        onChange={(e) =>
                          updateFormField(index, "name", e.target.value)
                        }
                        placeholder="e.g., riotId"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Label *</Label>
                      <Input
                        value={field.label}
                        onChange={(e) =>
                          updateFormField(index, "label", e.target.value)
                        }
                        placeholder="e.g., Riot ID"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Placeholder</Label>
                    <Input
                      value={field.placeholder || ""}
                      onChange={(e) =>
                        updateFormField(index, "placeholder", e.target.value)
                      }
                      placeholder="e.g., Please Input your Riot id"
                    />
                  </div>
                  {field.type === "select" && (
                    <div className="grid gap-2">
                      <Label>Options (comma-separated) *</Label>
                      <Input
                        value={
                          field.options?.join(", ") || ""
                        }
                        onChange={(e) =>
                          updateFormField(
                            index,
                            "options",
                            e.target.value
                              .split(",")
                              .map((opt) => opt.trim())
                              .filter(Boolean)
                          )
                        }
                        placeholder="e.g., Europe, America, Asia"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingProduct(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isPending}>
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

