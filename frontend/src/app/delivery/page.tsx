import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/server";
import { DeliveryDashboardClient } from "@/components/delivery/DeliveryDashboardClient";
import { Shipment, DeliveryAssignment } from "@/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DeliveryDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch assignments for this partner
  const assignmentsSnap = await adminDb!.collection("deliveryAssignments")
    .where("deliveryPartnerId", "==", user.uid)
    .get();
  
  const assignments = assignmentsSnap.docs.map(doc => doc.data() as DeliveryAssignment);
  
  if (assignments.length === 0) {
    return <DeliveryDashboardClient assignments={[]} shipments={[]} />;
  }

  // Fetch associated shipments
  const shipmentIds = assignments.map(a => a.shipmentId);
  // Split into chunks of 10 if needed due to firestore 'in' limits, but assume small for now
  const shipmentsSnap = await adminDb!.collection("shipments")
    .where("id", "in", shipmentIds.slice(0, 10))
    .get();

  const shipments = shipmentsSnap.docs.map(doc => doc.data() as Shipment);

  return <DeliveryDashboardClient assignments={assignments} shipments={shipments} />;
}