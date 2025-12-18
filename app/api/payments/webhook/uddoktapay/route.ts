import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/app/actions/payment";

/**
 * POST /api/payments/webhook/uddoktapay
 * Webhook endpoint for UddoktaPay payment notifications
 */
export async function POST(req: NextRequest) {
  try {
    // Verify API key from header (case-insensitive)
    // UddoktaPay sends: RT-UDDOKTAPAY-API-KEY
    const headers = req.headers;
    let apiKey: string | null = null;
    
    // Check both possible header formats (case-insensitive)
    for (const [key, value] of headers.entries()) {
      if (key.toLowerCase() === "rt-uddoktapay-api-key") {
        apiKey = value;
        break;
      }
    }
    
    const expectedApiKey = process.env.UDDOKTAPAY_API_KEY;

    if (!expectedApiKey) {
      // Don't log sensitive info - just return error
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    if (!apiKey || apiKey !== expectedApiKey) {
      // Log attempt without exposing the actual key
      console.warn("Webhook: Unauthorized access attempt");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const webhookData = await req.json();

    // Extract invoice_id from webhook data
    const invoiceId = webhookData.invoice_id;

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // Verify payment
    const result = await verifyPayment(invoiceId, "uddoktapay");

    if (!result.success) {
      console.error("Payment verification failed:", result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Log webhook for debugging (sanitized - no sensitive data)
    if (process.env.NODE_ENV === "development") {
      console.log("Payment webhook processed:", {
        invoiceId: invoiceId?.substring(0, 10) + "...", // Partial ID only
        orderId: result.orderId?.substring(0, 10) + "...", // Partial ID only
        status: result.paymentStatus,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
    });
  } catch {
    // Log error without exposing sensitive details
    console.error("Webhook processing error");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

