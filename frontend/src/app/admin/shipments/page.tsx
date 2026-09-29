import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import { ShipmentsClient } from "@/components/admin/ShipmentsClient";
import { Shipment, Order } from "@/types";

export const dynamic = "force-dynamic";

export default async function ShipmentsPage() {
  await requireAdmin();

  // Fetch all shipments
  const shipmentsSnap = await adminDb!.collection("shipments").orderBy("createdAt", "desc").get();
  const shipments = shipmentsSnap.docs.map(doc => doc.data() as Shipment);

  // Fetch eligible orders that don't have shipments yet
  const ordersSnap = await adminDb!.collection("orders")
    .where("status", "in", ["paid", "confirmed"])
    .get();
  
  let eligibleOrders = ordersSnap.docs.map(doc => doc.data() as Order);
  
  // Filter out orders that already have a shipment
  const existingShipmentOrderIds = new Set(shipments.map(s => s.orderId));
  eligibleOrders = eligibleOrders.filter(o => !existingShipmentOrderIds.has(o.id));

  return <ShipmentsClient shipments={shipments} eligibleOrders={eligibleOrders} />;
}