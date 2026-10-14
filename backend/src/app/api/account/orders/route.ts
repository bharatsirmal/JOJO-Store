import { NextResponse } from "next/server";
import { getCurrentUser } from "@/services/auth";
import { adminDb } from "@/config/firebase";
import type { Order, PaymentRecord } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { error: "Please sign in to view your orders." },
      { status: 401 },
    );
  if (!adminDb)
    return NextResponse.json(
      { error: "Order history unavailable." },
      { status: 503 },
    );
  try {
    const db = adminDb;
    // Single-field queries use Firestore's automatic indexes.
    const [orders, payments] = await Promise.all([
      db.collection("orders").where("customerId", "==", user.uid).get(),
      db.collection("payments").where("customerId", "==", user.uid).get(),
    ]);
    const owned = orders.docs.filter(
      (doc) => doc.data().customerId === user.uid,
    );
    const paymentByOrder = new Map<string, PaymentRecord>();
    for (const doc of payments.docs) {
      const payment = doc.data() as PaymentRecord;
      if (payment.customerId !== user.uid) continue;
      const previous = paymentByOrder.get(payment.orderId);
      if (!previous || (payment.updatedAt || "") > (previous.updatedAt || ""))
        paymentByOrder.set(payment.orderId, payment);
    }
    const shipmentByOrder = new Map<
      string,
      { status: string; updatedAt: string }
    >();
    const allowed = new Set(owned.map((doc) => doc.id));
    for (let offset = 0; offset < owned.length; offset += 10) {
      const shipments = await db
        .collection("shipments")
        .where(
          "orderId",
          "in",
          owned.slice(offset, offset + 10).map((doc) => doc.id),
        )
        .get();
      for (const doc of shipments.docs) {
        const shipment = doc.data();
        if (!allowed.has(shipment.orderId)) continue;
        const previous = shipmentByOrder.get(shipment.orderId);
        if (!previous || (shipment.updatedAt || "") > previous.updatedAt)
          shipmentByOrder.set(shipment.orderId, {
            status: shipment.status,
            updatedAt: shipment.updatedAt || "",
          });
      }
    }
    const result = owned
      .map((doc) => {
        const order = doc.data() as Order;
        const payment = paymentByOrder.get(doc.id);
        return {
          id: doc.id,
          items: order.items,
          totalMinor: order.totalMinor,
          currency: order.currency,
          status: order.status,
          createdAt: order.createdAt,
          reservationExpiresAt: order.reservationExpiresAt || null,
          paymentStatus: order.paymentReviewRequired
            ? "requires_review"
            : payment?.status || "pending",
          shipmentStatus: shipmentByOrder.get(doc.id)?.status || null,
        };
      })
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return NextResponse.json(
      { orders: result },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error(
      "Customer order history failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Unable to load your orders. Please try again." },
      { status: 503 },
    );
  }
}
