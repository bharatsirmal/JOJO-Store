import type Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { stripe } from "./stripe";
import { applyPaymentEvent } from "./events";
export async function paymentWebhook(req: NextRequest) {
  if (!stripe || !adminDb || !process.env.STRIPE_WEBHOOK_SECRET)
    return NextResponse.json({ error: "Webhook unavailable" }, { status: 503 });
  const signature = req.headers.get("stripe-signature");
  if (!signature)
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }
  try {
    const result = await applyPaymentEvent(adminDb, event);
    return NextResponse.json({ received: true, result });
  } catch (error) {
    console.error(
      "Payment event processing failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Payment processing temporarily unavailable" },
      { status: 500 },
    );
  }
}
