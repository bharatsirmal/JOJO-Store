import type Stripe from "stripe";
import type { Order, PaymentRecord } from "@/types";

const fulfilled = new Set([
  "confirmed",
  "paid",
  "processing",
  "shipped",
  "delivered",
]);
export async function applyPaymentEvent(
  db: FirebaseFirestore.Firestore,
  event: Stripe.Event,
) {
  if (
    !["payment_intent.succeeded", "payment_intent.payment_failed"].includes(
      event.type,
    )
  )
    return "ignored";
  const intent = event.data.object as Stripe.PaymentIntent,
    orderId = intent.metadata?.orderId;
  if (!orderId || !/^[A-Za-z0-9_-]{1,120}$/.test(orderId)) return "ignored";
  return db.runTransaction(async (t) => {
    const eventRef = db.collection("paymentEvents").doc(event.id),
      paymentRef = db.collection("payments").doc(intent.id),
      orderRef = db.collection("orders").doc(orderId);
    const eventDoc = await t.get(eventRef);
    if (eventDoc.exists) return "duplicate";
    const paymentDoc = await t.get(paymentRef),
      orderDoc = await t.get(orderRef);
    if (!orderDoc.exists) throw Error("Payment order not found");
    const order = orderDoc.data() as Order,
      payment = paymentDoc.data() as PaymentRecord | undefined,
      now = new Date().toISOString();
    const recordEvent = (result: string) =>
      t.set(eventRef, {
        type: event.type,
        paymentId: intent.id,
        orderId,
        result,
        createdAt: now,
      });
    if (
      payment &&
      [
        "captured",
        "refunded",
        "partially_refunded",
        "requires_review",
      ].includes(payment.status)
    ) {
      recordEvent("already_finalized");
      return "duplicate";
    }
    const bound =
      order.paymentIntentId === intent.id ||
      (!order.paymentIntentId &&
        payment?.orderId === orderId &&
        payment?.customerId === order.customerId);
    const identityMatches = intent.metadata.customerId === order.customerId;
    const record: PaymentRecord = {
      id: intent.id,
      orderId,
      customerId: order.customerId,
      provider: "stripe",
      providerPaymentReference: intent.id,
      amountMinor: intent.amount,
      currency: intent.currency,
      status: "failed",
      createdAt: payment?.createdAt || now,
      updatedAt: now,
    };
    if (event.type === "payment_intent.payment_failed") {
      // A failed attempt can arrive after a retry has already succeeded. Never
      // downgrade a captured payment or an already fulfilled order.
      if (bound && identityMatches && !fulfilled.has(order.status))
        t.set(paymentRef, record, { merge: true });
      recordEvent("failed");
      return "failed";
    }
    let reason: string | undefined;
    if (!bound || !identityMatches)
      reason = "Payment does not match the checkout.";
    else if (
      intent.status !== "succeeded" ||
      intent.amount !== order.totalMinor ||
      intent.amount_received !== order.totalMinor ||
      intent.currency.toLowerCase() !== order.currency.toLowerCase()
    )
      reason = "Payment amount or currency does not match the order.";
    else if (
      !["pending_payment", "payment_processing"].includes(order.status) &&
      !fulfilled.has(order.status)
    )
      reason = "Payment received for a cancelled or expired order.";
    const variants: {
      ref: FirebaseFirestore.DocumentReference;
      quantity: number;
      data: FirebaseFirestore.DocumentData;
    }[] = [];
    if (
      !reason &&
      !order.inventoryFinalizedAt &&
      !fulfilled.has(order.status)
    ) {
      const quantities = new Map<
        string,
        { productId: string; variantId: string; quantity: number }
      >();
      if (!Array.isArray(order.items) || !order.items.length)
        reason = "Order inventory is missing.";
      for (const item of order.items || []) {
        if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
          reason = "Invalid order quantity.";
          break;
        }
        const key = `${item.productId}/${item.variantId}`;
        quantities.set(key, {
          productId: item.productId,
          variantId: item.variantId,
          quantity: (quantities.get(key)?.quantity || 0) + item.quantity,
        });
      }
      if (!reason)
        for (const item of quantities.values()) {
          const ref = db
              .collection("products")
              .doc(item.productId)
              .collection("variants")
              .doc(item.variantId),
            snapshot = await t.get(ref),
            data = snapshot.data();
          if (
            !snapshot.exists ||
            !data ||
            !Number.isSafeInteger(data.stockAvailable) ||
            !Number.isSafeInteger(data.stockReserved) ||
            data.stockAvailable < item.quantity ||
            data.stockReserved < item.quantity
          ) {
            reason = "Reserved inventory is unavailable. Payment needs review.";
            break;
          }
          variants.push({ ref, quantity: item.quantity, data });
        }
    }
    // Every database read above precedes every write below, including the
    // deduplication marker. Firestore retries make concurrent deliveries safe.
    if (reason) {
      t.set(
        paymentRef,
        { ...record, status: "requires_review", reviewReason: reason },
        { merge: true },
      );
      t.update(orderRef, {
        paymentReviewRequired: true,
        paymentReviewReason: reason,
        updatedAt: now,
      });
      recordEvent("requires_review");
      return "requires_review";
    }
    for (const variant of variants)
      t.update(variant.ref, {
        stockAvailable: variant.data.stockAvailable - variant.quantity,
        stockReserved: variant.data.stockReserved - variant.quantity,
        updatedAt: now,
      });
    t.set(paymentRef, { ...record, status: "captured" }, { merge: true });
    t.update(orderRef, {
      ...(fulfilled.has(order.status) ? {} : { status: "confirmed" }),
      paymentIntentId: intent.id,
      inventoryFinalizedAt: order.inventoryFinalizedAt || now,
      updatedAt: now,
    });
    recordEvent("captured");
    return "captured";
  });
}
