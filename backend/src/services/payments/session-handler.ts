import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth, adminDb } from "@/config/firebase";
import { createPaymentIntent } from "./stripe";
import { CheckoutError, CHECKOUT_CURRENCY } from "./checkout";
import { checkoutFailure } from "./checkout-handlers";
import type { Order, PaymentRecord } from "@/types";
const schema = z.object({
  orderId: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[A-Za-z0-9_-]+$/),
});
function eligible(order: Order, uid: string) {
  if (order.customerId !== uid) throw new CheckoutError("Forbidden", 403);
  if (order.paymentReviewRequired)
    throw new CheckoutError(
      "This payment needs review. Do not pay again; contact the store.",
      409,
    );
  if (order.status !== "pending_payment")
    throw new CheckoutError("This order is not awaiting payment.", 409);
  if (
    order.currency.toLowerCase() !== CHECKOUT_CURRENCY ||
    !Number.isSafeInteger(order.totalMinor) ||
    order.totalMinor <= 0
  )
    throw new CheckoutError("Restart checkout to use a valid INR total.", 409);
  if (
    !order.reservationExpiresAt ||
    !Number.isFinite(Date.parse(order.reservationExpiresAt)) ||
    Date.parse(order.reservationExpiresAt) < Date.now()
  )
    throw new CheckoutError(
      "Order reservation expired. Please restart checkout.",
      409,
    );
}
export async function paymentSession(req: NextRequest) {
  try {
    if (!adminAuth || !adminDb)
      throw new CheckoutError("Payment service unavailable.", 503);
    const cookie = req.cookies.get("__session")?.value;
    if (!cookie) throw new CheckoutError("Unauthorized", 401);
    const user = await adminAuth.verifySessionCookie(cookie, true),
      { orderId } = schema.parse(await req.json()),
      db = adminDb;
    const ref = db.collection("orders").doc(orderId),
      snapshot = await ref.get();
    if (!snapshot.exists) throw new CheckoutError("Order not found", 404);
    const order = { ...snapshot.data(), id: ref.id } as Order;
    eligible(order, user.uid);
    let intent;
    try {
      intent = await createPaymentIntent(order, `intent_${order.id}`);
    } catch {
      throw new CheckoutError(
        "Payment gateway unavailable. Please try again.",
        503,
      );
    }
    if (
      intent.amount !== order.totalMinor ||
      intent.currency.toLowerCase() !== order.currency.toLowerCase() ||
      intent.metadata.orderId !== order.id ||
      intent.metadata.customerId !== order.customerId
    )
      throw new CheckoutError(
        "Payment does not match this order. Contact the store.",
        409,
      );
    if (intent.status === "canceled")
      throw new CheckoutError(
        "Payment was cancelled. Please restart checkout.",
        409,
      );
    await db.runTransaction(async (t) => {
      const current = await t.get(ref),
        paymentRef = db.collection("payments").doc(intent.id),
        payment = await t.get(paymentRef);
      if (!current.exists) throw new CheckoutError("Order not found", 404);
      const latest = { ...current.data(), id: ref.id } as Order;
      if (latest.customerId !== user.uid)
        throw new CheckoutError("Forbidden", 403);
      if (latest.paymentIntentId && latest.paymentIntentId !== intent.id)
        throw new CheckoutError(
          "Another payment is already linked to this order.",
          409,
        );
      if (latest.status !== "pending_payment") {
        if (
          latest.paymentIntentId === intent.id &&
          ["confirmed", "paid", "processing", "shipped", "delivered"].includes(
            latest.status,
          )
        )
          return;
        throw new CheckoutError(
          "The order changed. Refresh before paying.",
          409,
        );
      }
      eligible(latest, user.uid);
      if (
        latest.totalMinor !== intent.amount ||
        latest.currency.toLowerCase() !== intent.currency
      )
        throw new CheckoutError("Order total changed. Restart checkout.", 409);
      t.update(ref, {
        paymentIntentId: intent.id,
        updatedAt: new Date().toISOString(),
      });
      // Never reset an already captured/failed record during retries. The webhook
      // and this transaction can race; Firestore retries preserve the winner.
      if (!payment.exists) {
        const now = new Date().toISOString();
        const record: PaymentRecord = {
          id: intent.id,
          orderId,
          customerId: user.uid,
          provider: "stripe",
          providerPaymentReference: intent.id,
          amountMinor: order.totalMinor,
          currency: order.currency,
          status: "created",
          createdAt: now,
          updatedAt: now,
        };
        t.set(paymentRef, record);
      }
    });
    if (["succeeded", "processing", "requires_capture"].includes(intent.status))
      return NextResponse.json({
        orderUrl: `/payment/status?orderId=${encodeURIComponent(orderId)}`,
      });
    if (!intent.client_secret)
      throw new CheckoutError("Payment gateway unavailable.", 503);
    return NextResponse.json({
      clientSecret: intent.client_secret,
      paymentId: intent.id,
    });
  } catch (error) {
    return checkoutFailure(error);
  }
}
