import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import { ShipmentDetailClient } from "@/components/admin/ShipmentDetailClient";
import { Shipment, Order } from "@/types";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ShipmentDetailPage({ params }: { params: { shipmentId: string } }) {
  await requireAdmin();

  const shipmentSnap = await adminDb!.collection("shipments").doc(params.shipmentId).get();
  if (!shipmentSnap.exists) {
    notFound();
  }

  const shipment = shipmentSnap.data() as Shipment;

  const orderSnap = await adminDb!.collection("orders").doc(shipment.orderId).get();
  if (!orderSnap.exists) {
    notFound();
  }
  
  const order = orderSnap.data() as Order;

  // Fetch users with delivery_partner role
  const partnersSnap = await adminDb!.collection("users").where("role", "==", "delivery_partner").get();
  const deliveryPartners = partnersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return <ShipmentDetailClient shipment={shipment} order={order} deliveryPartners={deliveryPartners} />;
}
