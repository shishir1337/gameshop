"use server";

import {
  getDefaultPaymentGateway,
  getPaymentGateway,
  type PaymentProvider,
} from "@/lib/payments";
import { prisma } from "@/lib/prisma";

/**
 * Create payment for an order
 */
export async function createPayment(orderId: string) {
  try {
    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.paymentStatus !== "PENDING") {
      return {
        success: false,
        error: "Order payment status is not pending",
      };
    }

    // Get default payment gateway (UddoktaPay)
    const gateway = getDefaultPaymentGateway();
    if (!gateway) {
      return {
        success: false,
        error: "Payment gateway not configured",
      };
    }

    // Prepare customer information
    const customerName = order.user?.name || "Guest Customer";
    const customerEmail = order.email;

    // Create payment
    const paymentResult = await gateway.createPayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      customerName,
      customerEmail,
      metadata: {
        product_name: order.product.name,
      },
    });

    if (!paymentResult.success || !paymentResult.paymentUrl) {
      return {
        success: false,
        error: paymentResult.error || "Failed to create payment",
      };
    }

    return {
      success: true,
      paymentUrl: paymentResult.paymentUrl,
    };
  } catch (error: unknown) {
    console.error("Create payment error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create payment";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Verify payment using invoice ID
 */
export async function verifyPayment(
  invoiceId: string,
  provider: PaymentProvider = "uddoktapay"
) {
  try {
    const gateway = getPaymentGateway(provider);
    if (!gateway) {
      return {
        success: false,
        error: "Payment gateway not found",
      };
    }

    const verifyResult = await gateway.verifyPayment({ invoiceId });

    if (!verifyResult.success) {
      return {
        success: false,
        error: verifyResult.error || "Failed to verify payment",
      };
    }

    // Find order by metadata in the payment response
    let order = null;
    if (verifyResult.metadata?.order_id) {
      order = await prisma.order.findUnique({
        where: { id: verifyResult.metadata.order_id as string },
      });
    }

    if (!order) {
      return {
        success: false,
        error: "Order not found for this payment",
      };
    }

          // Update order payment status
          // Only update if payment is completed or failed, otherwise keep as PENDING
          let paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | undefined = undefined;
          let orderStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED" | undefined = undefined;

          if (verifyResult.status === "COMPLETED") {
            paymentStatus = "PAID";
            orderStatus = "PROCESSING";
          } else if (verifyResult.status === "FAILED") {
            paymentStatus = "FAILED";
            orderStatus = "FAILED";
          }
          // If status is PENDING or other, don't update (keep existing status)

    const updateData: {
      paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
      status?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
    } = {};
    
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    if (orderStatus) {
      updateData.status = orderStatus;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: updateData,
      include: {
        product: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Note: revalidatePath cannot be called during render.
    // Revalidation will happen naturally on next page visit or via route handlers.

    // Send payment status email (only if status was updated and not PENDING)
    if (paymentStatus || orderStatus) {
      try {
        const { sendPaymentStatusEmail } = await import("@/lib/email");
        const finalPaymentStatus = paymentStatus || updatedOrder.paymentStatus;
        // Only send email if payment status is not PENDING
        if (finalPaymentStatus !== "PENDING") {
          await sendPaymentStatusEmail({
            email: updatedOrder.email,
            orderNumber: updatedOrder.orderNumber,
            customerName: updatedOrder.user?.name || undefined,
            productName: updatedOrder.product.name,
            totalAmount: updatedOrder.totalAmount,
            paymentStatus: finalPaymentStatus as "PAID" | "FAILED" | "REFUNDED",
            orderStatus: (orderStatus || updatedOrder.status) as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED",
            orderDate: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          });
        }
      } catch (error) {
        console.error("Failed to send payment status email:", error);
        // Don't fail payment verification if email fails
      }
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentStatus: (paymentStatus || updatedOrder.paymentStatus) as "PAID" | "FAILED" | "REFUNDED",
      orderStatus: (orderStatus || updatedOrder.status) as "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED",
      verifyResult,
    };
  } catch (error: unknown) {
    console.error("Verify payment error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to verify payment";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

