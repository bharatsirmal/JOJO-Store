import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { adminDb } from "@/lib/firebase/admin";
import { ShipmentStatus } from "@/types";

export async function PATCH(req: Request, { params }: { params: { shipmentId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "delivery_partner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { status } = await req.json();

    // Verify assignment
    const assignmentSnap = await adminDb!.collection("deliveryAssignments")
      .where("shipmentId", "==", params.shipmentId)
      .where("deliveryPartnerId", "==", user.uid)
      .limit(1)
      .get();

    if (assignmentSnap.empty) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const validTransitions: Record<string, string[]> = {
      "pickup_scheduled": ["picked_up"],
      "picked_up": ["out_for_delivery"],
      "out_for_delivery": ["delivered", "delivery_failed"]
    };

    const shipmentSnap = await adminDb!.collection("shipments").doc(params.shipmentId).get();
    if (!shipmentSnap.exists) throw new Error("Shipment not found");
    
    const currentStatus = shipmentSnap.data()?.status as string;

    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json({ error: `Invalid transition from ${currentStatus} to ${status}` }, { status: 400 });
    }

    const batch = adminDb!.batch();
    
    // Update shipment
    batch.update(adminDb!.collection("shipments").doc(params.shipmentId), {
      status,
      updatedAt: new Date().toISOString()
    });

    // Update assignment if delivered
    if (status === "delivered" || status === "delivery_failed") {
      batch.update(adminDb!.collection("deliveryAssignments").doc(assignmentSnap.docs[0].id), {
        status: "completed",
        updatedAt: new Date().toISOString()
      });
      // also update order
      batch.update(adminDb!.collection("orders").doc(shipmentSnap.data()?.orderId), {
        status: status === "delivered" ? "delivered" : "shipped"
      });
    }

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
