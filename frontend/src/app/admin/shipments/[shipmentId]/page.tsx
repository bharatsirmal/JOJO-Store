import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import { ShipmentDetailClient } from "@/components/admin/ShipmentDetailClient";
import { Shipment, Order } from "@/types";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ShipmentDetailPage({
  params,
}: {
  params: { shipmentId: string };
}) {
  await requireAdmin();

  const shipmentSnap = await adminDb!
    .collection("shipments")
    .doc(params.shipmentId)
    .get();
  if (!shipmentSnap.exists) {
    notFound();
  }

  const shipment = JSON.parse(
    JSON.stringify({ ...shipmentSnap.data(), id: shipmentSnap.id }),
  ) as Shipment;

  const orderSnap = await adminDb!
    .collection("orders")
    .doc(shipment.orderId)
    .get();
  if (!orderSnap.exists) {
    notFound();
  }

  const order = JSON.parse(
    JSON.stringify({ ...orderSnap.data(), id: orderSnap.id }),
  ) as Order;

  // Fetch users with delivery_partner role
  const partnersSnap = await adminDb!
    .collection("users")
    .where("role", "==", "delivery_partner")
    .get();
  const deliveryPartners = partnersSnap.docs.map((doc) => ({
    id: doc.id,
    email: doc.data().email,
    displayName: doc.data().displayName,
  }));

  return (
    <ShipmentDetailClient
      shipment={shipment}
      order={order}
      deliveryPartners={deliveryPartners}
    />
  );
}
