import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/app/actions/payment";

/**
 * POST /api/payments/verify
 * Verify payment status using invoice ID
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceId, provider = "uddoktapay" } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const result = await verifyPayment(invoiceId, provider);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      paymentStatus: result.paymentStatus,
      orderStatus: result.orderStatus,
    });
  } catch (error: any) {
    console.error("Verify payment API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

