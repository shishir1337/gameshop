/**
 * UddoktaPay Payment Gateway Implementation
 * Documentation: https://www.uddoktapay.com
 */

import type {
  PaymentGateway,
  PaymentGatewayConfig,
  CreatePaymentRequest,
  CreatePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  PaymentStatus,
} from "./types";

export class UddoktaPayGateway implements PaymentGateway {
  name = "uddoktapay";
  private config: PaymentGatewayConfig;

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
  }

  async createPayment(
    request: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> {
    try {
      const baseUrl =
        this.config.baseUrl || "https://sandbox.uddoktapay.com";
      const redirectUrl = `${process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"}/payment/success`;
      const cancelUrl = `${process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"}/payment/cancel`;
      const webhookUrl = this.config.webhookUrl || `${process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"}/api/payments/webhook/uddoktapay`;

      const payload = {
        full_name: request.customerName,
        email: request.customerEmail,
        amount: request.amount.toString(),
        metadata: {
          order_id: request.orderId,
          order_number: request.orderNumber,
          ...request.metadata,
        },
        redirect_url: redirectUrl,
        cancel_url: cancelUrl,
        webhook_url: webhookUrl,
        return_type: "GET", // Use GET for redirect with invoice_id in query
      };

      const response = await fetch(`${baseUrl}/api/checkout-v2`, {
        method: "POST",
        headers: {
          "RT-UDDOKTAPAY-API-KEY": this.config.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        return {
          success: false,
          error: data.message || "Failed to create payment",
        };
      }

      return {
        success: true,
        paymentUrl: data.payment_url,
      };
    } catch (error: any) {
      console.error("UddoktaPay create payment error:", error);
      return {
        success: false,
        error: error.message || "Failed to create payment",
      };
    }
  }

  async verifyPayment(
    request: VerifyPaymentRequest
  ): Promise<VerifyPaymentResponse> {
    try {
      const baseUrl =
        this.config.baseUrl || "https://sandbox.uddoktapay.com";

      const response = await fetch(`${baseUrl}/api/verify-payment`, {
        method: "POST",
        headers: {
          "RT-UDDOKTAPAY-API-KEY": this.config.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          invoice_id: request.invoiceId,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === "ERROR") {
        return {
          success: false,
          error: data.message || "Failed to verify payment",
        };
      }

      // Map UddoktaPay status to our PaymentStatus
      let status: PaymentStatus = "PENDING";
      if (data.status === "COMPLETED") {
        status = "COMPLETED";
      } else if (data.status === "ERROR") {
        status = "FAILED";
      } else if (data.status === "PENDING") {
        status = "PENDING";
      }

      return {
        success: true,
        status,
        invoiceId: data.invoice_id,
        amount: data.amount,
        paymentMethod: data.payment_method,
        transactionId: data.transaction_id,
        date: data.date,
        metadata: data.metadata,
      };
    } catch (error: any) {
      console.error("UddoktaPay verify payment error:", error);
      return {
        success: false,
        error: error.message || "Failed to verify payment",
      };
    }
  }
}

