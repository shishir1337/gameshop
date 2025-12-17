"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  
  const [email, setEmail] = useState(emailParam || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp">(emailParam ? "otp" : "email");

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      setStep("otp");
    }
  }, [emailParam]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setStep("otp");
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to verify email");
        setOtp(""); // Clear OTP on error
      } else {
        toast.success("Email verified successfully! You can now log in.");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("An error occurred");
      toast.error(error.message);
      setOtp(""); // Clear OTP on error
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to resend verification code");
      } else {
        toast.success("Verification code sent! Check your email.");
        setOtp(""); // Clear current OTP
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("An error occurred");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
          <CardDescription>
            {step === "email"
              ? "Enter your email address to receive a verification code"
              : "Enter the 6-digit code sent to your email"}
          </CardDescription>
        </CardHeader>
        {step === "email" ? (
          <form onSubmit={handleEmailSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2 mb-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification Code
                  </>
                )}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                  Back to login
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Enter the 6-digit code sent to {email}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-primary hover:underline"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>
              <div className="text-sm text-center text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                  Back to login
                </Link>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}

