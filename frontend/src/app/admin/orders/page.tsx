import { adminDb } from "@/lib/firebase/admin";
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
import { Eye } from "lucide-react";

export default async function AdminOrdersPage() {
  await requireAdmin();

  if (!adminDb) {
    return <div className="p-8">Firebase Admin not configured.</div>;
  }

  const snapshot = await adminDb.collection("orders").orderBy("createdAt", "desc").get();
  
  const orders = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Order[];

  const formatPrice = (minor: number) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(minor / 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Manage and track customer orders.</p>
      </div>

      <div className="rounded-md border bg-card">
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
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const isConfirmed = order.status === "confirmed";
                const isPending = order.status === "pending_payment" || order.status === "payment_processing";
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium font-mono text-xs">{order.id}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={isConfirmed ? "default" : isPending ? "secondary" : "outline"}>
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