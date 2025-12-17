/**
 * Payment Gateway Factory
 * Centralized payment gateway management
 */

import { UddoktaPayGateway } from "./uddoktapay";
import type { PaymentGateway, PaymentGatewayConfig } from "./types";

export type PaymentProvider = "uddoktapay";

const paymentGateways = new Map<PaymentProvider, PaymentGateway>();

/**
 * Initialize payment gateways
 */
export function initializePaymentGateways() {
  // UddoktaPay Configuration
  const uddoktapayConfig: PaymentGatewayConfig = {
    apiKey: process.env.UDDOKTAPAY_API_KEY || "",
    baseUrl:
      process.env.UDDOKTAPAY_BASE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://pay.your-domain.com"
        : "https://sandbox.uddoktapay.com"),
    webhookUrl: process.env.UDDOKTAPAY_WEBHOOK_URL,
  };

  if (uddoktapayConfig.apiKey) {
    paymentGateways.set("uddoktapay", new UddoktaPayGateway(uddoktapayConfig));
  }
}

/**
 * Get payment gateway instance
 */
export function getPaymentGateway(
  provider: PaymentProvider
): PaymentGateway | null {
  if (paymentGateways.size === 0) {
    initializePaymentGateways();
  }
  return paymentGateways.get(provider) || null;
}

/**
 * Get default payment gateway
 */
export function getDefaultPaymentGateway(): PaymentGateway | null {
  if (paymentGateways.size === 0) {
    initializePaymentGateways();
  }
  // Return UddoktaPay as default
  return paymentGateways.get("uddoktapay") || null;
}

/**
 * Get all available payment providers
 */
export function getAvailablePaymentProviders(): PaymentProvider[] {
  if (paymentGateways.size === 0) {
    initializePaymentGateways();
  }
  return Array.from(paymentGateways.keys());
}

/**
 * Check if payment gateway is available
 */
export function isPaymentGatewayAvailable(
  provider: PaymentProvider
): boolean {
  if (paymentGateways.size === 0) {
    initializePaymentGateways();
  }
  return paymentGateways.has(provider);
}

// Initialize on module load
initializePaymentGateways();

