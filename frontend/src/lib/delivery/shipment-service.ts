import { adminDb } from "../firebase/admin";
import { Shipment, ShipmentStatus, TrackingEvent, DeliveryAssignment, Order } from "@/types";
import { randomUUID } from "crypto";

export class ShipmentService {
  /**
   * Evaluates if an order is eligible for fulfillment creation.
   * Only paid/confirmed orders are eligible.
   */
  static async validateOrderEligibility(orderId: string): Promise<boolean> {
    const doc = await adminDb!.collection("orders").doc(orderId).get();
    if (!doc.exists) return false;
    
    const data = doc.data() as Order;
    // Basic rules: Unpaid online-payment orders, cancelled orders, etc. are ineligible.
    // For now we check if status is confirmed or paid
    if (data.status === "confirmed" || (data.status as string) === "paid") {
      return true;
    }
    return false;
  }

  /**
   * Initializes a fulfillment task. 
   * Idempotent: If a shipment already exists for this order, returns it.
   */
  static async createFulfillmentTask(orderId: string): Promise<Shipment> {
    const isEligible = await this.validateOrderEligibility(orderId);
    if (!isEligible) {
      throw new Error(`Order ${orderId} is not eligible for fulfillment.`);
    }

    // Check idempotency
    const existingSnap = await adminDb!.collection("shipments").where("orderId", "==", orderId).limit(1).get();
    if (!existingSnap.empty) {
      return { id: existingSnap.docs[0].id, ...existingSnap.docs[0].data() } as Shipment;
    }

    // Fetch order snapshot to freeze delivery address
    const orderDoc = await adminDb!.collection("orders").doc(orderId).get();
    const orderData = orderDoc.data() as Order;

    const shipmentId = randomUUID();
    const newShipment: Shipment = {
      id: shipmentId,
      orderId,
      provider: "internal", // Defaulting to internal for Model B
      status: "fulfillment_pending",
      deliveryAddressSnapshot: orderData.shippingAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await adminDb!.collection("shipments").doc(shipmentId).set(newShipment);
    
    // Also update order status
    await adminDb!.collection("orders").doc(orderId).update({ status: "processing" });

    return newShipment;
  }

  /**
   * Admin explicitly marks an order as packed and ready for shipping.
   */
  static async markReadyForShipping(shipmentId: string): Promise<void> {
    const docRef = adminDb!.collection("shipments").doc(shipmentId);
    await adminDb!.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      if (!doc.exists) throw new Error("Shipment not found");
      
      const data = doc.data() as Shipment;
      if (data.status !== "fulfillment_pending" && data.status !== "packing") {
        throw new Error(`Cannot transition to ready_for_shipping from ${data.status}`);
      }

      t.update(docRef, { 
        status: "ready_for_shipping",
        updatedAt: new Date().toISOString()
      });
    });
  }

  /**
   * Assigns a shipment to an internal delivery partner.
   */
  static async assignDeliveryPartner(shipmentId: string, partnerId: string): Promise<DeliveryAssignment> {
    // Basic verification of shipment state
    const shipmentSnap = await adminDb!.collection("shipments").doc(shipmentId).get();
    if (!shipmentSnap.exists) throw new Error("Shipment not found");
    const shipment = shipmentSnap.data() as Shipment;

    if (shipment.status !== "ready_for_shipping" && shipment.status !== "booking_pending") {
      throw new Error(`Cannot assign courier from state ${shipment.status}`);
    }

    // Check if active assignment already exists
    const activeSnap = await adminDb!.collection("deliveryAssignments")
      .where("shipmentId", "==", shipmentId)
      .where("status", "in", ["assigned", "accepted"])
      .get();
      
    if (!activeSnap.empty) {
      throw new Error("Shipment already has an active delivery assignment.");
    }

    const assignmentId = randomUUID();
    const assignment: DeliveryAssignment = {
      id: assignmentId,
      shipmentId,
      deliveryPartnerId: partnerId,
      status: "assigned",
      assignedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const batch = adminDb!.batch();
    batch.set(adminDb!.collection("deliveryAssignments").doc(assignmentId), assignment);
    batch.update(adminDb!.collection("shipments").doc(shipmentId), {
      status: "pickup_scheduled",
      updatedAt: new Date().toISOString()
    });

    await batch.commit();

    return assignment;
  }
}
