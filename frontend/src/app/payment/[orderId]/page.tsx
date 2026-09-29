import { getCurrentUser } from "@/lib/auth/server";
import { adminDb } from "@/lib/firebase/admin";
import { notFound, redirect } from "next/navigation";
import { Order } from "@/types";
import { PaymentClient } from "./PaymentClient";

export const metadata = {
  title: "Secure Payment | JOJO Store",
};

export default async function PaymentPage({ params }: { params: { orderId: string } }) {
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
  if (order.customerId !== user.uid) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-2">Unauthorized</h1>
      </div>
    );
  }

  if (order.status !== "pending_payment") {
    redirect(`/orders/${order.id}`); // Redirect to order details if already paid or cancelled
  }

  return (
    <div className="bg-muted/30 min-h-[100dvh] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Complete Your Payment</h1>
        <PaymentClient order={order} />
      </div>
    </div>
  );
}
