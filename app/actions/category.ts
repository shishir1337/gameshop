"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/category";
import { requireAdmin } from "@/lib/utils/admin";

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("Get categories error:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function getActiveCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("Get active categories error:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function getCategory(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    
    if (!category) {
      return { success: false, error: "Category not found" };
    }
    
    return { success: true, data: category };
  } catch (error) {
    console.error("Get category error:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
    });
    
    if (!category) {
      return { success: false, error: "Category not found" };
    }
    
    return { success: true, data: category };
  } catch (error) {
    console.error("Get category by slug error:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

export async function createCategory(data: unknown) {
  try {
    await requireAdmin();

    const validatedData = categorySchema.parse(data);

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      return { success: false, error: "Category with this slug already exists" };
    }

    const category = await prisma.category.create({
      data: validatedData,
    });

    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error: unknown) {
    console.error("Create category error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return { success: false, error: "Invalid data provided" };
    }
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, data: unknown) {
  try {
    await requireAdmin();

    const validatedData = categorySchema.parse(data);

    // Check if slug is taken by another category
    const existing = await prisma.category.findFirst({
      where: {
        slug: validatedData.slug,
        NOT: { id },
      },
    });

    if (existing) {
      return { success: false, error: "Category with this slug already exists" };
    }

    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error: unknown) {
    console.error("Update category error:", error);
    if (error instanceof Error) {
      if (error.message === "Unauthorized: Admin access required") {
        return { success: false, error: "Unauthorized" };
      }
      if (error.name === "ZodError") {
        return { success: false, error: "Invalid data provided" };
      }
    }
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await requireAdmin();

    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    if (category._count.products > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${category._count.products} products`,
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: unknown) {
    console.error("Delete category error:", error);
    if (error instanceof Error && error.message === "Unauthorized: Admin access required") {
      return { success: false, error: "Unauthorized" };
    }
    return { success: false, error: "Failed to delete category" };
  }
}