import { NextRequest, NextResponse } from "next/server";
import { createPayment } from "@/app/actions/payment";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * POST /api/payments/create
 * Create a payment for an order
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Check if user is authenticated (for logged-in users)
    // Guest checkout is also allowed
    // Session check can be used for future features like order history
    await auth.api.getSession({
      headers: await headers(),
    });

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const result = await createPayment(orderId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: result.paymentUrl,
    });
  } catch (error: any) {
    console.error("Create payment API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

