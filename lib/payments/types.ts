/**
 * Payment Gateway Types
 */

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "REFUNDED";

export interface CreatePaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number; // Amount in BDT
  customerName: string;
  customerEmail: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentResponse {
  success: boolean;
  paymentUrl?: string;
  invoiceId?: string;
  error?: string;
}

export interface VerifyPaymentRequest {
  invoiceId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  status?: PaymentStatus;
  invoiceId?: string;
  amount?: string;
  paymentMethod?: string;
  transactionId?: string;
  date?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface PaymentGatewayConfig {
  apiKey: string;
  baseUrl: string;
  webhookUrl?: string;
}

export interface PaymentGateway {
  name: string;
  createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse>;
  verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse>;
}

