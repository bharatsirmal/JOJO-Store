import { adminDb } from "@/lib/backend/db";
import { requireAdmin } from "@/lib/auth/server";
import { Order } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { adminDate } from "@/lib/admin/metrics";
import { Eye } from "lucide-react";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  await requireAdmin();

  if (!adminDb) {
    return <div className="p-8">Firebase Admin not configured.</div>;
  }

  const snapshot = await adminDb
    .collection("orders")
    .orderBy("createdAt", "desc")
    .get();

  const allOrders = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[];

  const orders = allOrders.filter(
    (order) =>
      (!searchParams.status || order.status === searchParams.status) &&
      (order.id + " " + (order.shippingAddress?.fullName || ""))
        .toLowerCase()
        .includes((searchParams.q || "").toLowerCase()),
  );
  const formatPrice = (minor: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(minor / 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Manage and track customer orders.
        </p>
      </div>

      <div className="admin-panel overflow-hidden">
        <form
          method="get"
          className="admin-toolbar p-4 border-b flex flex-wrap gap-3"
        >
          <input
            name="q"
            aria-label="Search orders"
            placeholder="Search order ID or customer..."
            defaultValue={searchParams.q}
            className="px-4 w-full sm:max-w-xs"
          />
          <select
            name="status"
            aria-label="Order status"
            defaultValue={searchParams.status || ""}
            className="px-3"
          >
            <option value="">All statuses</option>
            {Array.from(new Set(allOrders.map((order) => order.status)))
              .sort()
              .map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
          </select>
          <Button type="submit">Apply filters</Button>
        </form>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Ref</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const isConfirmed = order.status === "confirmed";
                const isPending =
                  order.status === "pending_payment" ||
                  order.status === "payment_processing";
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium font-mono text-xs">
                      {order.id}
                    </TableCell>
                    <TableCell>
                      {adminDate(order.createdAt)?.toLocaleDateString() ||
                        "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          isConfirmed
                            ? "default"
                            : isPending
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {order.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrice(order.totalMinor)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View Order</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
