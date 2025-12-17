import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft, Package } from "lucide-react";
import { verifyPayment } from "@/app/actions/payment";

interface PaymentSuccessPageProps {
  searchParams: Promise<{ invoice_id?: string }>;
}

async function PaymentSuccessContent({ invoiceId }: { invoiceId?: string }) {
  if (!invoiceId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Payment Information Missing
          </CardTitle>
          <CardDescription>
            No payment information was found. Please contact support if you completed a payment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Verify payment
  const verifyResult = await verifyPayment(invoiceId, "uddoktapay");

  if (!verifyResult.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Payment Verification Failed
          </CardTitle>
          <CardDescription>
            {verifyResult.error || "Unable to verify payment. Please contact support."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isCompleted = verifyResult.paymentStatus === "PAID";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          ) : (
            <Package className="h-8 w-8 text-yellow-500" />
          )}
          <CardTitle>
            {isCompleted ? "Payment Successful!" : "Payment Pending"}
          </CardTitle>
        </div>
        <CardDescription>
          {isCompleted
            ? "Your payment has been processed successfully."
            : "Your payment is being processed. Please wait for confirmation."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">Order Number:</span>
            <span className="font-medium">{verifyResult.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">Payment Status:</span>
            <span className="font-medium capitalize">{verifyResult.paymentStatus?.toLowerCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">Order Status:</span>
            <span className="font-medium capitalize">{verifyResult.orderStatus?.toLowerCase()}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const params = await searchParams;
  const invoiceId = params.invoice_id;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black px-4">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>Verifying Payment...</CardTitle>
                <CardDescription>Please wait while we verify your payment.</CardDescription>
              </CardHeader>
            </Card>
          }
        >
          <PaymentSuccessContent invoiceId={invoiceId} />
        </Suspense>
      </div>
    </div>
  );
}

