import { EmailTemplate } from "@/components/email-template";
import { resend, DEFAULT_FROM_EMAIL } from "@/lib/resend";
import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/send
 * Send a test email using Resend
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, firstName = "John" } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 }
      );
    }

    const emailHtml = await render(EmailTemplate({ firstName }));
    
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject: "Welcome to GameShop!",
      html: emailHtml,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}

