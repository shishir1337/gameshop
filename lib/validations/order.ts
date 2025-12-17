import { z } from "zod";
import { getAvailablePaymentProviders } from "@/lib/payments";

/**
 * Payment provider options - dynamically get from available gateways
 * Default to uddoktapay if no providers available
 */
const availableProviders = getAvailablePaymentProviders();
export const PAYMENT_PROVIDERS = (availableProviders.length > 0
  ? availableProviders
  : ["uddoktapay"]) as readonly string[];

/**
 * Create order schema
 */
export const createOrderSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().min(1, "Variant ID is required"),
  email: z.string().email("Invalid email address"),
  userId: z.string().optional(), // Optional for guest checkout
  userFormData: z
    .record(
      z.string().min(1).max(100), // Key: max 100 chars
      z.string().min(0).max(500) // Value: max 500 chars, sanitized
    )
    .optional()
    .refine(
      (data) => {
        if (!data) return true;
        // Limit number of fields
        return Object.keys(data).length <= 20;
      },
      { message: "Too many form fields" }
    ), // User form data (Riot ID, Player ID, etc.)
  paymentProvider: z.string().optional(), // Optional - will use default if not provided
});

export type CreateOrderRequest = z.infer<typeof createOrderSchema>;

