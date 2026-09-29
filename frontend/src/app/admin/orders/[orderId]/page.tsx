import { requireAdmin } from "@/lib/auth/server";
import { adminDb } from "@/lib/firebase/admin";
import { Order } from "@/types";
import { notFound } from "next/navigation";
const formatPrice = (minor: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(minor / 100);
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Package, User, CreditCard } from "lucide-react";
import Link from "next/link";
import OrderDetailActions from "./OrderDetailActions";
import Image from "next/image";

export default async function AdminOrderDetailPage({ params }: { params: { orderId: string } }) {
  await requireAdmin();

  if (!adminDb) return null;

  const orderDoc = await adminDb!.collection("orders").doc(params.orderId).get();
  if (!orderDoc.exists) {
    notFound();
  }

  const order = { id: orderDoc.id, ...orderDoc.data() } as Order;
  
  // Fetch customer email
  let customerEmail = "Unknown";
  try {
    const userDoc = await adminDb!.collection("users").doc(order.customerId).get();
    if (userDoc.exists) {
      customerEmail = userDoc.data()?.email || "Unknown";
    }
  } catch (e) {}

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-slate-500 text-sm mt-1">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
            {order.status}
          </Badge>
          <OrderDetailActions orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="w-5 h-5" />
                Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden relative shrink-0">
                          {item.imagePath ? (
                            <Image src={item.imagePath} alt={item.productName} fill sizes="48px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-slate-500">{item.size} | {item.color}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(item.unitPriceMinor)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium">{formatPrice(item.unitPriceMinor * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span>{formatPrice(order.subtotalMinor)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Shipping</span>
                <span>{formatPrice(order.shippingMinor)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax</span>
                <span>{formatPrice(order.taxMinor)}</span>
              </div>
              <div className="pt-4 border-t flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(order.totalMinor)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Customer Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Email</p>
                <p className="font-medium">{customerEmail}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Shipping Address</p>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.stateOrProvince} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.countryCode}</p>
                <p className="mt-2 text-slate-500">Phone: <span className="text-slate-900">{order.shippingAddress.phone}</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

