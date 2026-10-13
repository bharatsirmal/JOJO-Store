import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { stripe } from "@/lib/payments/stripe";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Firebase Admin is not configured" }, { status: 500 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    if (decoded.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { paymentId, amountMinor, reason } = await req.json();
    if (!paymentId || !amountMinor) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

    // Fetch Payment Record
    const paymentDoc = await adminDb.collection("payments").doc(paymentId).get();
    if (!paymentDoc.exists) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    const payment = paymentDoc.data()!;

    // Create a refund using idempotency key derived from payment and time
    const idempotencyKey = `refund_${paymentId}_${Date.now()}`;

    const refund = await stripe.refunds.create({
      payment_intent: payment.providerPaymentReference,
      amount: amountMinor,
      reason: reason || 'requested_by_customer'
    }, { idempotencyKey });

    // Store Refund Record
    const refundRef = adminDb.collection("refunds").doc(refund.id);
    await refundRef.set({
      id: refund.id,
      paymentId: paymentId,
      orderId: payment.orderId,
      providerRefundReference: refund.id,
      amountMinor,
      reason: reason || 'requested_by_customer',
      status: refund.status === "succeeded" ? "succeeded" : "pending",
      createdAt: new Date().toISOString()
    });

    // Update payment record to reflect refund
    await paymentDoc.ref.update({
      status: amountMinor === payment.amountMinor ? "refunded" : "partially_refunded",
      updatedAt: new Date().toISOString()
    });

    // Note: Inventory is deliberately NOT restocked here. That requires a separate RMA flow.

    return NextResponse.json({ success: true, refundId: refund.id });

  } catch (error: unknown) {
    console.error("Refund failed:", error);
    return NextResponse.json({ error: (error as Error).message || "Refund processing failed" }, { status: 500 });
  }
}
