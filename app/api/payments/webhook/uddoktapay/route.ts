import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/app/actions/payment";

/**
 * POST /api/payments/webhook/uddoktapay
 * Webhook endpoint for UddoktaPay payment notifications
 */
export async function POST(req: NextRequest) {
  try {
    // Verify API key from header
    const apiKey = req.headers.get("rt-uddoktapay-api-key");
    const expectedApiKey = process.env.UDDOKTAPAY_API_KEY;

    if (!expectedApiKey) {
      console.error("UDDOKTAPAY_API_KEY not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    if (apiKey !== expectedApiKey) {
      console.error("Invalid API key in webhook request");
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

    // Log webhook for debugging
    console.log("Payment webhook processed:", {
      invoiceId,
      orderId: result.orderId,
      status: result.paymentStatus,
    });

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

