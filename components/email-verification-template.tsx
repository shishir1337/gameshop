import * as React from "react";

interface EmailVerificationTemplateProps {
  firstName?: string;
  otpCode: string;
}

export function EmailVerificationTemplate({
  firstName,
  otpCode,
}: EmailVerificationTemplateProps) {
  const appUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
  
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Verify Your Email Address</h1>
      {firstName ? (
        <p>Hello {firstName},</p>
      ) : (
        <p>Hello,</p>
      )}
      <p>
        Thank you for signing up for GameShop! Please verify your email address using the verification code below:
      </p>
      <div style={{ 
        marginTop: "30px", 
        marginBottom: "30px",
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        border: "2px dashed #0070f3"
      }}>
        <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#666" }}>
          Your verification code is:
        </p>
        <p style={{ 
          margin: "0", 
          fontSize: "32px", 
          fontWeight: "bold", 
          letterSpacing: "8px",
          color: "#0070f3",
          fontFamily: "monospace"
        }}>
          {otpCode}
        </p>
      </div>
      <p style={{ marginTop: "20px" }}>
        Enter this code on the verification page to complete your registration.
      </p>
      <p style={{ marginTop: "20px" }}>
        <a
          href={`${appUrl}/verify-email`}
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          Go to Verification Page
        </a>
      </p>
      <p style={{ marginTop: "20px", fontSize: "12px", color: "#999" }}>
        This code will expire in 15 minutes. If you didn't create this account, please ignore this email.
      </p>
    </div>
  );
}

