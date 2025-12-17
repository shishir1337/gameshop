import type { PasswordResetTemplateProps } from "@/types/components";

export function PasswordResetTemplate({
  resetLink,
  firstName,
}: PasswordResetTemplateProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Reset Your Password</h1>
      {firstName && <p>Hello {firstName},</p>}
      <p>We received a request to reset your password. Click the link below to reset it:</p>
      <p>
        <a
          href={resetLink}
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this URL into your browser:</p>
      <p style={{ wordBreak: "break-all", color: "#666" }}>{resetLink}</p>
      <p style={{ marginTop: "20px", fontSize: "12px", color: "#999" }}>
        This link will expire in 1 hour. If you didn&apos;t request this, please ignore this email.
      </p>
    </div>
  );
}

