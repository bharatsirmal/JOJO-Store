import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/server";
import { DeliveryAssignmentDetailClient } from "@/components/delivery/DeliveryAssignmentDetailClient";
import { Shipment, DeliveryAssignment } from "@/types";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DeliveryAssignmentPage({ params }: { params: { shipmentId: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "delivery_partner") redirect("/login");

  // Check authorization - is this shipment actually assigned to this user?
  const assignmentSnap = await adminDb!.collection("deliveryAssignments")
    .where("shipmentId", "==", params.shipmentId)
    .where("deliveryPartnerId", "==", user.uid)
    .limit(1)
    .get();

  if (assignmentSnap.empty) {
    redirect("/delivery");
  }

  const shipmentSnap = await adminDb!.collection("shipments").doc(params.shipmentId).get();
  if (!shipmentSnap.exists) {
    notFound();
  }

  const shipment = shipmentSnap.data() as Shipment;

  return <DeliveryAssignmentDetailClient shipment={shipment} />;
}
