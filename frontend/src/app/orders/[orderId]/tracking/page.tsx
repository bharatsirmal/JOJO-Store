import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/server";
import { TrackingClient } from "@/components/TrackingClient";
import { Shipment, Order } from "@/types";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Verify ownership
  const orderSnap = await adminDb!.collection("orders").doc(params.orderId).get();
  if (!orderSnap.exists) notFound();
  
  const order = orderSnap.data() as Order;
  if (order.customerId !== user.uid) redirect("/unauthorized");

  // Fetch shipment if it exists
  const shipmentSnap = await adminDb!.collection("shipments").where("orderId", "==", params.orderId).limit(1).get();
  
  let shipment: Shipment | null = null;
  if (!shipmentSnap.empty) {
    shipment = shipmentSnap.docs[0].data() as Shipment;
  }

  return <TrackingClient shipment={shipment} />;
}
