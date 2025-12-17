interface PaymentStatusTemplateProps {
  orderNumber: string;
  customerName?: string;
  productName: string;
  totalAmount: number;
  paymentStatus: "PAID" | "FAILED" | "REFUNDED";
  orderStatus: string;
  orderDate: string;
}

export function PaymentStatusTemplate({
  orderNumber,
  customerName,
  productName,
  totalAmount,
  paymentStatus,
  orderStatus,
  orderDate,
}: PaymentStatusTemplateProps) {
  const isSuccess = paymentStatus === "PAID";
  const statusText =
    paymentStatus === "PAID"
      ? "Payment Successful"
      : paymentStatus === "FAILED"
      ? "Payment Failed"
      : "Payment Refunded";
  const statusColor = isSuccess ? "#10b981" : paymentStatus === "FAILED" ? "#ef4444" : "#6b7280";

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#000000", color: "#ffffff", padding: "20px", textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "24px" }}>{statusText}</h1>
      </div>

      <div style={{ padding: "20px" }}>
        <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
          {customerName ? `Hello ${customerName},` : "Hello,"}
        </p>
        <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
          {isSuccess
            ? "Great news! Your payment has been successfully processed."
            : paymentStatus === "FAILED"
            ? "We encountered an issue processing your payment."
            : "Your payment has been refunded."}
        </p>

        <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", margin: "24px 0" }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: "#6b7280", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Order Number:</div>
            <div style={{ color: "#111827", fontSize: "16px", fontWeight: "600" }}>{orderNumber}</div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: "#6b7280", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Product:</div>
            <div style={{ color: "#111827", fontSize: "16px", fontWeight: "600" }}>{productName}</div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: "#6b7280", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Amount:</div>
            <div style={{ color: "#111827", fontSize: "16px", fontWeight: "600" }}>৳{totalAmount}</div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: "#6b7280", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Payment Status:</div>
            <div style={{ color: statusColor, fontSize: "16px", fontWeight: "600" }}>{paymentStatus}</div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: "#6b7280", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Order Status:</div>
            <div style={{ color: "#111827", fontSize: "16px", fontWeight: "600" }}>{orderStatus}</div>
          </div>
          <div>
            <div style={{ color: "#6b7280", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Date:</div>
            <div style={{ color: "#111827", fontSize: "16px", fontWeight: "600" }}>{orderDate}</div>
          </div>
        </div>

        {isSuccess && (
          <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
            Your order is now being processed. You will receive another email once your order is completed.
          </p>
        )}

        {paymentStatus === "FAILED" && (
          <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
            Please try placing your order again. If the problem persists, please contact our support team.
          </p>
        )}

        <hr style={{ borderColor: "#e5e7eb", margin: "32px 0" }} />

        <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6", margin: "0" }}>
          If you have any questions, please contact our support team.
        </p>
        <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6", margin: "16px 0 0" }}>
          Thank you for choosing GameShop!
        </p>
      </div>
    </div>
  );
}
