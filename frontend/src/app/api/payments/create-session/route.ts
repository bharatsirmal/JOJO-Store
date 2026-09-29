import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { createPaymentIntent } from "@/lib/payments/stripe";
import { Order, PaymentRecord } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Firebase Admin is not configured" }, { status: 500 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    const body = await req.json();
    const { orderId } = body;
    
    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    // 1. Fetch Authoritative Order
    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderDoc.data() as Order;

    // 2. Security checks
    if (order.customerId !== decoded.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.status !== "pending_payment") {
      return NextResponse.json({ error: `Order is not eligible for payment (Current status: ${order.status})` }, { status: 400 });
    }
    
    if (order.reservationExpiresAt && new Date(order.reservationExpiresAt) < new Date()) {
      // Note: A real system would attempt to reclaim/validate stock here if expired,
      // but to be safe we'll reject it to prevent a payment for out-of-stock items.
      return NextResponse.json({ error: "Order reservation expired. Please restart checkout." }, { status: 400 });
    }

    // 3. Generate Stripe Payment Intent (Idempotent per order)
    // We use `intent_${order.id}` as the idempotency key so multiple clicks don't create multiple intents
    const intentIdempotencyKey = `intent_${order.id}`;
    let paymentIntent;
    
    try {
      paymentIntent = await createPaymentIntent(order, intentIdempotencyKey);
    } catch (stripeErr: unknown) {
      console.error("Stripe error:", stripeErr);
      return NextResponse.json({ error: "Payment gateway unavailable" }, { status: 503 });
    }

    // 4. Create internal payment tracking record
    const paymentId = paymentIntent.id;
    const paymentRef = adminDb.collection("payments").doc(paymentId);
    
    // We don't use runTransaction here because we ALREADY called an external API (Stripe) 
    // which violates Firestore retriable transaction rules. So we just set it.
    const now = new Date().toISOString();
    const paymentRecord: PaymentRecord = {
      id: paymentId,
      orderId: order.id,
      customerId: order.customerId,
      provider: "stripe",
      providerPaymentReference: paymentIntent.id,
      amountMinor: order.totalMinor,
      currency: order.currency,
      status: "created",
      createdAt: now,
      updatedAt: now,
    };

    await paymentRef.set(paymentRecord, { merge: true });

    // 5. Return Client Secret to frontend
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id
    });

  } catch (error: unknown) {
    console.error("Session creation failed:", error);
    return NextResponse.json({ error: (error as Error).message || "Internal Server Error" }, { status: 500 });
  }
}
