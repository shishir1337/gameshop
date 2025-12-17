"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { requireAdmin } from "@/lib/utils/admin";

/**
 * Get all products (admin use, no filter)
 */
export async function getProducts(categoryId?: string) {
  try {
    const products = await prisma.product.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: { orders: true },
        },
      },
    });
    return { success: true, data: products };
  } catch (error) {
    console.error("Get products error:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

/**
 * Get active products (public use)
 */
export async function getActiveProducts(categoryId?: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId && { categoryId }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    return { success: true, data: products };
  } catch (error) {
    console.error("Get active products error:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("Get product error:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

/**
 * Get a single product by slug (public use)
 */
export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!product || !product.isActive) {
      return { success: false, error: "Product not found" };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("Get product by slug error:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

/**
 * Create a new product
 */
export async function createProduct(data: unknown) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const validatedData = productSchema.parse(data);

    // Check if slug already exists
    const existing = await prisma.product.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      return { success: false, error: "Product with this slug already exists" };
    }

    // Create product with variants
    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        image: validatedData.image || null,
        categoryId: validatedData.categoryId,
        isActive: validatedData.isActive,
        userFormFields: validatedData.userFormFields || undefined,
        variants: {
          create: validatedData.variants.map((variant, index) => ({
            name: variant.name,
            price: variant.price, // Price already in BDT as integer
            isActive: variant.isActive,
            sortOrder: variant.sortOrder ?? index,
          })),
        },
      },
      include: {
        category: true,
        variants: true,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, data: product };
  } catch (error: any) {
    console.error("Create product error:", error);
    if (error.message === "Unauthorized: Admin access required") {
      return { success: false, error: "Unauthorized" };
    }
    if (error.name === "ZodError") {
      return { success: false, error: "Invalid data provided" };
    }
    return { success: false, error: "Failed to create product" };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, data: unknown) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const validatedData = productSchema.parse(data);

    // Check if slug is taken by another product
    const existing = await prisma.product.findFirst({
      where: {
        slug: validatedData.slug,
        NOT: { id },
      },
    });

    if (existing) {
      return { success: false, error: "Product with this slug already exists" };
    }

    // Get current product to get slug for revalidation
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: { slug: true },
    });

    // Delete old variants and create new ones
    await prisma.productVariant.deleteMany({
      where: { productId: id },
    });

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        image: validatedData.image || null,
        categoryId: validatedData.categoryId,
        isActive: validatedData.isActive,
        userFormFields: validatedData.userFormFields || undefined,
        variants: {
          create: validatedData.variants.map((variant, index) => ({
            name: variant.name,
            price: variant.price, // Price already in BDT as integer
            isActive: variant.isActive,
            sortOrder: variant.sortOrder ?? index,
          })),
        },
      },
      include: {
        category: true,
        variants: true,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    if (currentProduct) {
      revalidatePath(`/products/${currentProduct.slug}`);
    }
    revalidatePath(`/products/${product.slug}`);
    return { success: true, data: product };
  } catch (error: any) {
    console.error("Update product error:", error);
    if (error.message === "Unauthorized: Admin access required") {
      return { success: false, error: "Unauthorized" };
    }
    if (error.name === "ZodError") {
      return { success: false, error: "Invalid data provided" };
    }
    return { success: false, error: "Failed to update product" };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Check if product has orders
    const orderCount = await prisma.order.count({
      where: { productId: id },
    });

    if (orderCount > 0) {
      return {
        success: false,
        error: `Cannot delete product with ${orderCount} orders`,
      };
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Delete product error:", error);
    if (error.message === "Unauthorized: Admin access required") {
      return { success: false, error: "Unauthorized" };
    }
    return { success: false, error: "Failed to delete product" };
  }
}

