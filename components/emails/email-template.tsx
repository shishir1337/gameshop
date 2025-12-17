
interface EmailTemplateProps {
  firstName: string;
}

export function EmailTemplate({ firstName }: EmailTemplateProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Welcome, {firstName}!</h1>
      <p>Thank you for joining us. We&apos;re excited to have you on board!</p>
    </div>
  );
}

