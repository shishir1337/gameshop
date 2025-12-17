import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Calendar, Mail, CreditCard } from "lucide-react";
import { getOrderByNumber } from "@/app/actions/order";

interface OrderDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderNumber } = await params;
  const result = await getOrderByNumber(orderNumber);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data;

  const getStatusBadge = (status: typeof order.status) => {
    const variants: Record<typeof status, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      PROCESSING: "default",
      COMPLETED: "default",
      FAILED: "destructive",
      CANCELLED: "outline",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: typeof order.paymentStatus) => {
    const variants: Record<typeof status, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      PAID: "default",
      FAILED: "destructive",
      REFUNDED: "outline",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>

          {/* Order Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Order Details</CardTitle>
                  <CardDescription className="mt-2">
                    Order Number: <span className="font-mono">{order.orderNumber}</span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(order.status)}
                  {getPaymentStatusBadge(order.paymentStatus)}
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    {order.product.image ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-lg border">
                        <Image
                          src={order.product.image}
                          alt={order.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-lg border bg-zinc-100 dark:bg-zinc-900">
                        <Package className="h-12 w-12 text-zinc-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                        {order.product.name}
                      </h3>
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link href={`/products/${order.product.slug}`}>
                          View Product
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{item.variant.name}</div>
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">
                            Quantity: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">৳{item.price}</div>
                          {item.quantity > 1 && (
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                              ৳{item.price * item.quantity} total
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              {order.userFormData &&
                Object.keys(order.userFormData as Record<string, unknown>).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(
                          order.userFormData as Record<string, unknown>
                        ).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b last:border-0">
                            <span className="text-zinc-600 dark:text-zinc-400 capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Subtotal:</span>
                    <span className="font-medium">৳{order.totalAmount}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>৳{order.totalAmount}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-zinc-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Order Date</div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-zinc-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Email</div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {order.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-zinc-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Payment Method</div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">
                        {order.paymentProvider}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

