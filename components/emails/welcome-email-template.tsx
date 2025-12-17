
interface WelcomeEmailTemplateProps {
  firstName?: string;
  email: string;
}

export function WelcomeEmailTemplate({
  firstName,
  email,
}: WelcomeEmailTemplateProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Welcome to GameShop!</h1>
      {firstName ? (
        <p>Hello {firstName},</p>
      ) : (
        <p>Hello,</p>
      )}
      <p>
        Thank you for creating an account with us. Your account has been successfully created with the email: <strong>{email}</strong>
      </p>
      <p>You can now start shopping and enjoy our amazing collection of games!</p>
      <p style={{ marginTop: "20px" }}>
        <a
          href={process.env.BETTER_AUTH_URL || "http://localhost:3000"}
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          Start Shopping
        </a>
      </p>
      <p style={{ marginTop: "20px", fontSize: "12px", color: "#999" }}>
        If you didn&apos;t create this account, please contact our support team.
      </p>
    </div>
  );
}

