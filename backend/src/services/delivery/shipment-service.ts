import { adminDb } from "@/config/firebase";
import {
  Shipment,
  ShipmentStatus,
  TrackingEvent,
  DeliveryAssignment,
  Order,
} from "@/types";
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
    if (!adminDb) throw new Error("Shipping service unavailable");
    const db = adminDb;
    return db.runTransaction(async (t) => {
      const existing = await t.get(
        db.collection("shipments").where("orderId", "==", orderId).limit(1),
      );
      if (!existing.empty)
        return {
          ...existing.docs[0].data(),
          id: existing.docs[0].id,
        } as Shipment;
      const orderRef = db.collection("orders").doc(orderId);
      const orderDoc = await t.get(orderRef);
      if (!orderDoc.exists) throw new Error("Order not found");
      const order = orderDoc.data() as Order;
      if (!["paid", "confirmed"].includes(order.status))
        throw new Error("Only paid or confirmed orders can be packed.");
      const shipment: Shipment = {
        id: orderId,
        orderId,
        provider: "internal",
        status: "fulfillment_pending",
        deliveryAddressSnapshot: order.shippingAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      t.set(db.collection("shipments").doc(orderId), shipment);
      t.update(orderRef, {
        status: "processing",
        updatedAt: shipment.updatedAt,
      });
      return shipment;
    });
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
        throw new Error(
          `Cannot transition to ready_for_shipping from ${data.status}`,
        );
      }

      t.update(docRef, {
        status: "ready_for_shipping",
        updatedAt: new Date().toISOString(),
      });
    });
  }

  /**
   * Assigns a shipment to an internal delivery partner.
   */
  static async assignDeliveryPartner(
    shipmentId: string,
    partnerId: string,
  ): Promise<DeliveryAssignment> {
    if (!adminDb) throw new Error("Shipping service unavailable");
    const db = adminDb;
    return db.runTransaction(async (t) => {
      const ref = db.collection("shipments").doc(shipmentId);
      const shipment = await t.get(ref);
      const partner = await t.get(db.collection("users").doc(partnerId));
      const assignments = await t.get(
        db
          .collection("deliveryAssignments")
          .where("shipmentId", "==", shipmentId),
      );
      if (!shipment.exists) throw new Error("Shipment not found");
      if (!partner.exists || partner.data()?.role !== "delivery_partner")
        throw new Error("Select an approved delivery partner.");
      const active = assignments.docs.find((doc) =>
        ["assigned", "accepted"].includes(doc.data().status),
      );
      if (active) {
        if (active.data().deliveryPartnerId === partnerId)
          return { ...active.data(), id: active.id } as DeliveryAssignment;
        throw new Error(
          "This shipment already has an active delivery partner.",
        );
      }
      if (
        !["ready_for_shipping", "booking_pending"].includes(
          shipment.data()?.status,
        )
      )
        throw new Error("Pack the shipment before assigning delivery.");
      const assignment: DeliveryAssignment = {
        id: randomUUID(),
        shipmentId,
        deliveryPartnerId: partnerId,
        status: "assigned",
        assignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      t.set(
        db.collection("deliveryAssignments").doc(assignment.id),
        assignment,
      );
      t.update(ref, {
        status: "pickup_scheduled",
        updatedAt: assignment.updatedAt,
      });
      return assignment;
    });
  }
}
