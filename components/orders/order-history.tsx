"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Eye, Calendar } from "lucide-react";
import type { Order } from "@prisma/client";
import Image from "next/image";

type OrderWithRelations = Order & {
  product: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    variant: {
      name: string;
      price: number;
    };
  }>;
};

interface OrderHistoryProps {
  orders: OrderWithRelations[];
}

export function OrderHistory({ orders }: OrderHistoryProps) {
  const getStatusBadge = (status: Order["status"]) => {
    const variants: Record<Order["status"], "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      PROCESSING: "default",
      COMPLETED: "default",
      FAILED: "destructive",
      CANCELLED: "outline",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: Order["paymentStatus"]) => {
    const variants: Record<Order["paymentStatus"], "default" | "secondary" | "destructive" | "outline"> = {
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-zinc-400 mb-4" />
          <h3 className="text-xl font-semibold text-black dark:text-zinc-50 mb-2">
            No Orders Yet
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-center">
            You haven&apos;t placed any orders yet. Start shopping to see your orders here.
          </p>
          <Button asChild>
            <Link href="/">Browse Products</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            {orders.length} order{orders.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {order.product.image ? (
                          <div className="relative h-12 w-12 overflow-hidden rounded border">
                            <Image
                              src={order.product.image}
                              alt={order.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded border bg-zinc-100 dark:bg-zinc-900">
                            <Package className="h-6 w-6 text-zinc-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{order.product.name}</div>
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="text-sm">
                            {item.variant.name} × {item.quantity}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ৳{order.totalAmount}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                    <TableCell className="text-sm text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(order.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/orders/${order.orderNumber}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

