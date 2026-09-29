import { getCurrentUser } from "@/lib/auth/server";
import { adminDb } from "@/lib/firebase/admin";
import { notFound, redirect } from "next/navigation";
import { Order } from "@/types";
import { CheckCircle2, Package, MapPin, Truck } from "lucide-react";

export default async function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (!adminDb) {
    return <div className="p-8 text-center text-destructive">Firebase Admin is not configured.</div>;
  }

  const orderDoc = await adminDb.collection("orders").doc(params.orderId).get();
  if (!orderDoc.exists) {
    notFound();
  }

  const order = orderDoc.data() as Order;
  if (order.customerId !== user.uid && user.role !== "admin") {
    // Prevent access to other users' orders
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-2">Unauthorized</h1>
        <p className="text-muted-foreground">You do not have permission to view this order.</p>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 min-h-[100dvh] py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-background rounded-xl p-8 shadow-sm border text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Order Received</h1>
          <p className="text-muted-foreground mb-6">Thank you for shopping with us.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm font-medium">
              <span>Order #{order.id}</span>
            </div>
            <a href={`/orders/${order.id}/tracking`} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors">
              <Truck className="w-4 h-4" /> Track Shipment
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-background rounded-xl p-6 shadow-sm border">
            <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" /> Shipping Address</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.countryCode}</p>
              <p className="pt-2">{order.shippingAddress.phone}</p>
            </div>
          </div>
          <div className="bg-background rounded-xl p-6 shadow-sm border">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Package className="w-4 h-4" /> Order Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">{order.status.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-muted/30">
            <h3 className="font-bold">Order Summary</h3>
          </div>
          <div className="p-6 space-y-6">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-20 bg-muted rounded shrink-0 overflow-hidden">
                  {item.imagePath && <img src={item.imagePath} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 text-sm">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{item.productName}</p>
                    <p className="font-medium">${(item.unitPriceMinor / 100).toFixed(2)}</p>
                  </div>
                  <p className="text-muted-foreground mt-1">{item.size} {item.color}</p>
                  <p className="text-muted-foreground mt-1">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-muted/30 border-t space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${(order.subtotalMinor / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">${(order.shippingMinor / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">${(order.taxMinor / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold border-t pt-3 mt-3">
              <span>Total</span>
              <span>${(order.totalMinor / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
