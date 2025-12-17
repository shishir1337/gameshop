import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ConditionalHeader, ConditionalFooter } from "@/components/layout/conditional-header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { EmailVerificationProvider } from "@/components/auth/email-verification-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GameShop - Authentication System",
  description: "A complete authentication solution with email verification, OAuth support, and secure session management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <EmailVerificationProvider>
            <div className="flex min-h-screen flex-col">
              <ConditionalHeader />
              <main className="flex-1">{children}</main>
              <ConditionalFooter />
            </div>
            <Toaster />
          </EmailVerificationProvider>
        </ThemeProvider>
      </body>

    </html>
  );
}
