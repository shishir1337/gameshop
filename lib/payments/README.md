# Payment Gateway System

This directory contains a modular payment gateway system that allows easy integration of multiple payment providers.

## Structure

```
lib/payments/
├── types.ts          # TypeScript interfaces and types
├── index.ts          # Payment gateway factory and utilities
├── uddoktapay.ts     # UddoktaPay implementation
└── README.md         # This file
```

## Current Payment Gateways

### UddoktaPay (Default)

UddoktaPay is the default payment gateway, supporting:
- bKash
- Nagad
- Rocket
- Upay
- Bank Transfer

**Configuration:**
- `UDDOKTAPAY_API_KEY` - Your UddoktaPay API key
- `UDDOKTAPAY_BASE_URL` - API base URL (sandbox or production)
- `UDDOKTAPAY_WEBHOOK_URL` - Webhook callback URL (optional)

## Adding a New Payment Gateway

To add a new payment gateway:

1. **Create a new gateway class** in `lib/payments/your-gateway.ts`:

```typescript
import type {
  PaymentGateway,
  PaymentGatewayConfig,
  CreatePaymentRequest,
  CreatePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "./types";

export class YourGateway implements PaymentGateway {
  name = "your-gateway";
  private config: PaymentGatewayConfig;

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
  }

  async createPayment(
    request: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> {
    // Implement payment creation logic
  }

  async verifyPayment(
    request: VerifyPaymentRequest
  ): Promise<VerifyPaymentResponse> {
    // Implement payment verification logic
  }
}
```

2. **Register the gateway** in `lib/payments/index.ts`:

```typescript
import { YourGateway } from "./your-gateway";

export type PaymentProvider = "uddoktapay" | "your-gateway";

function initializePaymentGateways() {
  // ... existing code ...
  
  // Add your gateway
  const yourGatewayConfig: PaymentGatewayConfig = {
    apiKey: process.env.YOUR_GATEWAY_API_KEY || "",
    baseUrl: process.env.YOUR_GATEWAY_BASE_URL || "",
    webhookUrl: process.env.YOUR_GATEWAY_WEBHOOK_URL,
  };

  if (yourGatewayConfig.apiKey) {
    paymentGateways.set("your-gateway", new YourGateway(yourGatewayConfig));
  }
}
```

3. **Create webhook handler** in `app/api/payments/webhook/your-gateway/route.ts`

4. **Update environment variables** in `.env.example`

## Usage

### Server Actions

```typescript
import { createPayment, verifyPayment } from "@/app/actions/payment";

// Create payment
const result = await createPayment(orderId);
if (result.success) {
  // Redirect to result.paymentUrl
}

// Verify payment
const verifyResult = await verifyPayment(invoiceId, "uddoktapay");
```

### API Routes

- `POST /api/payments/create` - Create payment for an order
- `POST /api/payments/verify` - Verify payment status
- `POST /api/payments/webhook/uddoktapay` - Webhook handler

## Payment Flow

1. **Order Creation** - Order is created with `PENDING` status
2. **Payment Creation** - Payment gateway creates payment URL
3. **Customer Redirect** - Customer is redirected to payment gateway
4. **Payment Processing** - Customer completes payment
5. **Webhook/Verification** - Payment status is verified
6. **Order Update** - Order status is updated based on payment result

## Testing

For testing with UddoktaPay sandbox:
- Use sandbox API key: `982d381360a69d419689740d9f2e26ce36fb7a50`
- Base URL: `https://sandbox.uddoktapay.com`

## Security

- Never expose API keys in client-side code
- Always validate webhook requests using API key
- Use HTTPS for all webhook endpoints
- Verify payment status server-side before fulfilling orders

