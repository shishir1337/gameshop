interface OrderConfirmationTemplateProps {
  orderNumber: string;
  customerName?: string;
  productName: string;
  totalAmount: number;
  paymentUrl?: string;
  orderDate: string;
}

export function OrderConfirmationTemplate({
  orderNumber,
  customerName,
  productName,
  totalAmount,
  paymentUrl,
  orderDate,
}: OrderConfirmationTemplateProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#000000", color: "#ffffff", padding: "20px", textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "24px" }}>Order Confirmation</h1>
      </div>

      <div style={{ padding: "20px" }}>
        <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
          {customerName ? `Hello ${customerName},` : "Hello,"}
        </p>
        <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
          Thank you for your order! We&apos;ve received your order and it&apos;s being processed.
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
            <div style={{ color: "#6b7280", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Total Amount:</div>
            <div style={{ color: "#111827", fontSize: "16px", fontWeight: "600" }}>৳{totalAmount}</div>
          </div>
          <div>
            <div style={{ color: "#6b7280", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Order Date:</div>
            <div style={{ color: "#111827", fontSize: "16px", fontWeight: "600" }}>{orderDate}</div>
          </div>
        </div>

        {paymentUrl && (
          <>
            <p style={{ fontSize: "16px", lineHeight: "1.6", marginBottom: "20px" }}>
              Please complete your payment by clicking the button below:
            </p>
            <div style={{ textAlign: "center", margin: "32px 0" }}>
              <a
                href={paymentUrl}
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                Complete Payment
              </a>
            </div>
          </>
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
