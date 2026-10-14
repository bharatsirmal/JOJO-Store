import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/auth";
import { adminDb } from "@/config/firebase";
import { stripe } from "@/services/payments/stripe";
import { applyPaymentEvent } from "@/services/payments/events";
import type Stripe from "stripe";
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { error: "Please sign in to check your payment." },
      { status: 401 },
    );
  if (!adminDb)
    return NextResponse.json(
      { error: "Payment verification unavailable" },
      { status: 503 },
    );
  try {
    let orderId = req.nextUrl.searchParams.get("orderId");
    const paymentId = req.nextUrl.searchParams.get("paymentId");
    if (!orderId && paymentId && /^pi_[A-Za-z0-9]+$/.test(paymentId)) {
      const payment = await adminDb.collection("payments").doc(paymentId).get();
      if (payment.data()?.customerId !== user.uid)
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 },
        );
      orderId = payment.data()!.orderId;
    }
    if (!orderId || !/^[A-Za-z0-9_-]{1,120}$/.test(orderId))
      return NextResponse.json(
        { error: "Missing valid order ID" },
        { status: 400 },
      );
    const ref = adminDb.collection("orders").doc(orderId);
    let order = await ref.get();
    let paymentState: string | undefined;
    if (!order.exists || order.data()?.customerId !== user.uid)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    // Read-only Stripe retrieval can reconcile a delayed or missed webhook. The
    // same atomic finalizer protects inventory when the real webhook arrives.
    if (
      stripe &&
      order.data()?.paymentIntentId &&
      !order.data()?.paymentReviewRequired &&
      ["pending_payment", "payment_processing"].includes(order.data()!.status)
    ) {
      try {
        const intent = await stripe.paymentIntents.retrieve(
          order.data()!.paymentIntentId,
        );
        paymentState = intent.status;
        if (intent.status === "succeeded") {
          await applyPaymentEvent(adminDb, {
            id: `reconcile_${intent.id}`,
            object: "event",
            api_version: null,
            created: Math.floor(Date.now() / 1000),
            livemode: intent.livemode,
            pending_webhooks: 0,
            request: null,
            type: "payment_intent.succeeded",
            data: { object: intent },
          } as Stripe.Event);
          order = await ref.get();
        }
      } catch {
        return NextResponse.json(
          { orderId, status: "payment_processing", requiresReview: false },
          { headers: { "Cache-Control": "private, no-store" } },
        );
      }
    }
    const data = order.data()!;
    return NextResponse.json(
      {
        orderId,
        status: data.status,
        paymentState,
        requiresReview: !!data.paymentReviewRequired,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to check payment. Please try again." },
      { status: 503 },
    );
  }
}
