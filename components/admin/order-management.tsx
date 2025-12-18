"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import {
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
  exportOrdersToCSV,
  updateOrderNotes,
} from "@/app/actions/order";
import type { Order, OrderStatus, PaymentStatus } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, RefreshCw, Eye, Download, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type OrderWithRelations = Order & {
  product: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
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

export function OrderManagement() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderWithRelations[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    orderId: string;
    type: "order" | "payment";
    newStatus: OrderStatus | PaymentStatus;
    currentStatus: OrderStatus | PaymentStatus;
  } | null>(null);
  const [orderStatusValues, setOrderStatusValues] = useState<Record<string, OrderStatus>>({});
  const [paymentStatusValues, setPaymentStatusValues] = useState<Record<string, PaymentStatus>>({});

  const loadOrders = async () => {
    startTransition(async () => {
      try {
        const result = await getOrders({
          status: statusFilter,
          paymentStatus: paymentStatusFilter,
          search: search || undefined,
        });
        if (result.success && result.data) {
          setOrders(result.data as OrderWithRelations[]);
        } else {
          toast.error(result.error || "Failed to load orders");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load orders"
        );
      }
    });
  };

  // Filter orders
  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, paymentStatusFilter]);

  // Search filter
  useEffect(() => {
    if (search) {
      const filtered = orders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          order.email.toLowerCase().includes(search.toLowerCase()) ||
          order.product.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [search, orders]);

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        toast.success("Order status updated");
        // Remove from local state and reload
        setOrderStatusValues((prev) => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
        loadOrders();
      } else {
        toast.error(result.error || "Failed to update order status");
        // Reset to original value on error
        setOrderStatusValues((prev) => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
        loadOrders();
      }
    } catch {
      toast.error("Failed to update order status");
      // Reset to original value on error
      setOrderStatusValues((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
      loadOrders();
    } finally {
      setPendingStatusChange(null);
    }
  };

  const handlePaymentStatusUpdate = async (
    orderId: string,
    newStatus: PaymentStatus
  ) => {
    try {
      const result = await updatePaymentStatus(orderId, newStatus);
      if (result.success) {
        toast.success("Payment status updated");
        // Remove from local state and reload
        setPaymentStatusValues((prev) => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
        loadOrders();
      } else {
        toast.error(result.error || "Failed to update payment status");
        // Reset to original value on error
        setPaymentStatusValues((prev) => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
        loadOrders();
      }
    } catch {
      toast.error("Failed to update payment status");
      // Reset to original value on error
      setPaymentStatusValues((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
      loadOrders();
    } finally {
      setPendingStatusChange(null);
    }
  };

  const confirmStatusChange = () => {
    if (!pendingStatusChange) return;
    
    if (pendingStatusChange.type === "order") {
      handleStatusUpdate(
        pendingStatusChange.orderId,
        pendingStatusChange.newStatus as OrderStatus
      );
    } else {
      handlePaymentStatusUpdate(
        pendingStatusChange.orderId,
        pendingStatusChange.newStatus as PaymentStatus
      );
    }
  };

  const cancelStatusChange = () => {
    if (!pendingStatusChange) return;
    
    // Reset the Select value to original
    if (pendingStatusChange.type === "order") {
      setOrderStatusValues((prev) => {
        const updated = { ...prev };
        delete updated[pendingStatusChange.orderId];
        return updated;
      });
    } else {
      setPaymentStatusValues((prev) => {
        const updated = { ...prev };
        delete updated[pendingStatusChange.orderId];
        return updated;
      });
    }
    
    setPendingStatusChange(null);
  };

  const getStatusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      PROCESSING: "default",
      COMPLETED: "default",
      FAILED: "destructive",
      CANCELLED: "outline",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              try {
                const result = await exportOrdersToCSV({
                  status: statusFilter,
                  paymentStatus: paymentStatusFilter,
                  search: search || undefined,
                });
                if (result.success && result.data) {
                  const blob = new Blob([result.data], { type: "text/csv" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                  toast.success("Orders exported successfully");
                } else {
                  toast.error(result.error || "Failed to export orders");
                }
              } catch {
                toast.error("Failed to export orders");
              }
            }}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={loadOrders}
            disabled={isPending}
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Order Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Status</label>
              <Select
                value={paymentStatusFilter}
                onValueChange={setPaymentStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending && filteredOrders.length === 0 && orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.user?.name || "Guest"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ৳{order.totalAmount}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={orderStatusValues[order.id] || order.status}
                          onValueChange={(value) => {
                            if (value !== order.status) {
                              // Update display value immediately
                              setOrderStatusValues((prev) => ({
                                ...prev,
                                [order.id]: value as OrderStatus,
                              }));
                              // Show confirmation dialog
                              setPendingStatusChange({
                                orderId: order.id,
                                type: "order",
                                newStatus: value as OrderStatus,
                                currentStatus: order.status,
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={paymentStatusValues[order.id] || order.paymentStatus}
                          onValueChange={(value) => {
                            if (value !== order.paymentStatus) {
                              // Update display value immediately
                              setPaymentStatusValues((prev) => ({
                                ...prev,
                                [order.id]: value as PaymentStatus,
                              }));
                              // Show confirmation dialog
                              setPendingStatusChange({
                                orderId: order.id,
                                type: "payment",
                                newStatus: value as PaymentStatus,
                                currentStatus: order.paymentStatus,
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                            <SelectItem value="REFUNDED">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderNotes(order.notes || "");
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order Number: {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name: </span>
                    {selectedOrder.user?.name || "Guest"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    {selectedOrder.email}
                  </div>
                  {selectedOrder.user && (
                    <div>
                      <span className="text-muted-foreground">User ID: </span>
                      <span className="font-mono text-xs">
                        {selectedOrder.user.id}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h3 className="font-semibold mb-2">Product Information</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Product: </span>
                    {selectedOrder.product.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payment Provider: </span>
                    {selectedOrder.paymentProvider}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <div>
                        <div className="font-medium">{item.variant.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </div>
                      </div>
                      <div className="font-semibold">৳{item.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Form Data */}
              {selectedOrder.userFormData &&
                Object.keys(selectedOrder.userFormData as Record<string, unknown>).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Additional Information</h3>
                    <div className="space-y-1 text-sm">
                      {Object.entries(
                        selectedOrder.userFormData as Record<string, unknown>
                      ).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}:{" "}
                          </span>
                          {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-xl font-bold">৳{selectedOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Order Status:</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-muted-foreground">Payment Status:</span>
                  {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Created: {formatDate(selectedOrder.createdAt)}
                </div>
              </div>

              {/* Order Notes */}
              <div className="border-t pt-4">
                <Label htmlFor="order-notes" className="font-semibold mb-2 block">
                  Admin Notes
                </Label>
                <Textarea
                  id="order-notes"
                  placeholder="Add internal notes about this order..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={4}
                  className="mb-2"
                />
                <Button
                  onClick={async () => {
                    if (!selectedOrder) return;
                    setIsSavingNotes(true);
                    try {
                      const result = await updateOrderNotes(selectedOrder.id, orderNotes);
                      if (result.success) {
                        toast.success("Notes saved successfully");
                        loadOrders();
                      } else {
                        toast.error(result.error || "Failed to save notes");
                      }
                    } catch {
                      toast.error("Failed to save notes");
                    } finally {
                      setIsSavingNotes(false);
                    }
                  }}
                  disabled={isSavingNotes}
                  size="sm"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {isSavingNotes ? "Saving..." : "Save Notes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog
        open={pendingStatusChange !== null}
        onOpenChange={(open) => {
          if (!open) {
            cancelStatusChange();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatusChange?.type === "order"
                ? "Change Order Status"
                : "Change Payment Status"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the{" "}
              {pendingStatusChange?.type === "order"
                ? "order status"
                : "payment status"}{" "}
              from{" "}
              <strong>
                {pendingStatusChange?.currentStatus}
              </strong>{" "}
              to{" "}
              <strong>
                {pendingStatusChange?.newStatus}
              </strong>
              ?
              {pendingStatusChange?.type === "order" &&
                pendingStatusChange.newStatus === "CANCELLED" && (
                  <span className="block mt-2 text-destructive">
                    Warning: Cancelling an order cannot be undone.
                  </span>
                )}
              {pendingStatusChange?.type === "payment" &&
                pendingStatusChange.newStatus === "REFUNDED" && (
                  <span className="block mt-2 text-destructive">
                    Warning: Refunding a payment will update the order status.
                  </span>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelStatusChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

