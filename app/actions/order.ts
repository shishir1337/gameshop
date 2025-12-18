"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validations/order";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { requireAdmin } from "@/lib/utils/admin";

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(4).toString("hex").toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Create a new order
 */
export async function createOrder(data: unknown) {
  try {
    // Validate input
    const validatedData = createOrderSchema.parse(data);

    // REQUIRE USER TO BE LOGGED IN - No guest checkout allowed
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { 
        success: false, 
        error: "You must be logged in to place an order. Please log in and try again." 
      };
    }

    const userId = session.user.id;

    // Get user email from session/database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Use email from database (more reliable than validatedData.email)
    const email = user.email;

    // Verify product and variant exist and are active
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
      include: {
        variants: {
          where: { id: validatedData.variantId, isActive: true },
        },
      },
    });

    if (!product || !product.isActive) {
      return { success: false, error: "Product not found or inactive" };
    }

    if (product.variants.length === 0) {
      return { success: false, error: "Variant not found or inactive" };
    }

    const variant = product.variants[0];
    const totalAmount = variant.price;

    // Use default payment provider if not specified
    const paymentProvider =
      validatedData.paymentProvider || "uddoktapay";

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId, // Always required now - no guest checkout
        email,
        productId: validatedData.productId,
        userFormData: validatedData.userFormData 
          ? Object.fromEntries(
              Object.entries(validatedData.userFormData).map(([key, value]) => [
                // Sanitize keys: only alphanumeric and underscore
                key.replace(/[^a-zA-Z0-9_]/g, "_"),
                // Sanitize values: remove potential XSS characters
                String(value)
                  .replace(/[<>]/g, "") // Remove < and >
                  .trim()
                  .slice(0, 500), // Enforce max length
              ])
            )
          : {},
        paymentProvider,
        paymentStatus: "PENDING",
        totalAmount,
        status: "PENDING",
        items: {
          create: {
            variantId: validatedData.variantId,
            quantity: 1,
            price: variant.price,
          },
        },
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
          },
        },
        items: {
          include: {
            variant: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/");
    revalidatePath(`/products/${product.slug}`);

    // Create payment URL using payment gateway
    const { createPayment } = await import("./payment");
    const paymentResult = await createPayment(order.id);

    // Send order confirmation email
    try {
      const { sendOrderConfirmationEmail } = await import("@/lib/email");
      const customerName = userId
        ? await prisma.user
            .findUnique({ where: { id: userId }, select: { name: true } })
            .then((u) => u?.name || undefined)
        : undefined;

      await sendOrderConfirmationEmail({
        email,
        orderNumber: order.orderNumber,
        customerName,
        productName: product.name,
        totalAmount: order.totalAmount,
        paymentUrl: paymentResult.success ? paymentResult.paymentUrl : undefined,
        orderDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      });
    } catch (error) {
      console.error("Failed to send order confirmation email:", error);
      // Don't fail order creation if email fails
    }

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentProvider: order.paymentProvider,
        status: order.status,
        paymentUrl: paymentResult.success ? paymentResult.paymentUrl : undefined,
      },
    };
  } catch (error: unknown) {
    console.error("Create order error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      const zodError = error as { errors?: Array<{ message?: string }> };
      return {
        success: false,
        error: zodError.errors?.[0]?.message || "Invalid data provided",
      };
    }
    return { success: false, error: "Failed to create order" };
  }
}

/**
 * Get all orders (admin use)
 */
export async function getOrders(filters?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
}) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const where: import("@prisma/client").Prisma.OrderWhereInput = {};

    if (filters?.status && filters.status !== "all") {
      where.status = filters.status as import("@prisma/client").OrderStatus;
    }

    if (filters?.paymentStatus && filters.paymentStatus !== "all") {
      where.paymentStatus = filters.paymentStatus as import("@prisma/client").PaymentStatus;
    }

    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        {
          product: {
            name: { contains: filters.search, mode: "insensitive" },
          },
        },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            variant: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return { success: true, data: orders };
  } catch (error: unknown) {
    console.error("Get orders error:", error);
    if (error instanceof Error && error.message === "Unauthorized: Admin access required") {
      return { success: false, error: "Unauthorized" };
    }
    return { success: false, error: "Failed to fetch orders" };
  }
}

/**
 * Get a single order by ID
 */
export async function getOrder(id: string) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            variant: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, data: order };
  } catch (error: unknown) {
    console.error("Get order error:", error);
    if (error instanceof Error && error.message === "Unauthorized: Admin access required") {
      return { success: false, error: "Unauthorized" };
    }
    return { success: false, error: "Failed to fetch order" };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED"
) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        product: {
          select: {
            slug: true,
          },
        },
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, data: order };
  } catch (error: unknown) {
    console.error("Update order status error:", error);
    if (error instanceof Error && error.message === "Unauthorized: Admin access required") {
      return { success: false, error: "Unauthorized" };
    }
    return { success: false, error: "Failed to update order status" };
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus },
      include: {
        product: {
          select: {
            slug: true,
          },
        },
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, data: order };
  } catch (error: unknown) {
    console.error("Update payment status error:", error);
    if (error instanceof Error && error.message === "Unauthorized: Admin access required") {
      return { success: false, error: "Unauthorized" };
    }
    return { success: false, error: "Failed to update payment status" };
  }
}

/**
 * Get orders for current user
 */
export async function getUserOrders() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
        items: {
          include: {
            variant: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return { success: true, data: orders };
  } catch (error) {
    console.error("Get user orders error:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

/**
 * Get order by order number (public - for users to view their orders)
 */
export async function getOrderByNumber(orderNumber: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
        items: {
          include: {
            variant: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // REQUIRE USER TO BE LOGGED IN - No guest checkout
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: "You must be logged in to view orders. Please log in and try again." 
      };
    }

    // Verify user owns this order
    if (order.userId !== session.user.id) {
      return { success: false, error: "Unauthorized - This order does not belong to you" };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error("Get order by number error:", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

/**
 * Export orders to CSV
 */
export async function exportOrdersToCSV(filters?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
}) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const result = await getOrders(filters);
    if (!result.success || !result.data) {
      return { success: false, error: result.error || "Failed to fetch orders" };
    }

    const orders = result.data;
    
    // CSV headers
    const headers = [
      "Order Number",
      "Date",
      "Customer Email",
      "Customer Name",
      "Product",
      "Variant",
      "Quantity",
      "Total Amount",
      "Payment Provider",
      "Payment Status",
      "Order Status",
      "Notes",
    ];

    // CSV rows
    const rows = orders.map((order) => {
      const variantName = order.items[0]?.variant?.name || "N/A";
      const quantity = order.items[0]?.quantity || 1;
      const customerName = order.user?.name || "Guest";
      
      return [
        order.orderNumber,
        new Date(order.createdAt).toLocaleString(),
        order.email,
        customerName,
        order.product.name,
        variantName,
        quantity.toString(),
        `৳${order.totalAmount}`,
        order.paymentProvider,
        order.paymentStatus,
        order.status,
        (order as any).notes || "",
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    return { success: true, data: csvContent };
  } catch (error: unknown) {
    console.error("Export orders error:", error);
    if (error instanceof Error && error.message === "Unauthorized: Admin access required") {
      return { success: false, error: "Unauthorized" };
    }
    return { success: false, error: "Failed to export orders" };
  }
}

/**
 * Update order notes
 */
export async function updateOrderNotes(orderId: string, notes: string) {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { notes: notes.trim() || null },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, data: order };
  } catch (error: unknown) {
    console.error("Update order notes error:", error);
    if (error instanceof Error && error.message === "Unauthorized: Admin access required") {
      return { success: false, error: "Unauthorized" };
    }
    return { success: false, error: "Failed to update order notes" };
  }
}
