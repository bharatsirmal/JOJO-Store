import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { stripe } from "@/lib/payments/stripe";
import { PaymentRecord, Order } from "@/types";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }
  if (!adminDb) {
    return NextResponse.json({ error: "Firebase Admin is not configured" }, { status: 500 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  try {
    // To verify the signature, we need the raw body text
    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    // 1. Idempotency: Check if we already processed this event
    const eventRef = adminDb.collection("paymentEvents").doc(event.id);
    const eventDoc = await eventRef.get();
    if (eventDoc.exists) {
      return NextResponse.json({ received: true, note: "Duplicate event ignored" });
    }

    // Process specific events
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const paymentId = paymentIntent.id;
        const metadata = paymentIntent.metadata;
        const orderId = metadata?.orderId;

        if (orderId) {
          // Transaction to finalize payment and inventory
          await adminDb.runTransaction(async (transaction) => {
            const db = adminDb!;
            const orderRef = db.collection("orders").doc(orderId);
            const paymentRef = db.collection("payments").doc(paymentId);
            
            const orderDoc = await transaction.get(orderRef);
            if (!orderDoc.exists) throw new Error("Order not found");
            
            const order = orderDoc.data() as Order;
            if (order.status === "confirmed") {
              return; // Already confirmed
            }

            // A. Update Order Status
            transaction.update(orderRef, {
              status: "confirmed",
              updatedAt: new Date().toISOString()
            });

            // B. Update Payment Record
            const paymentRecord: Partial<PaymentRecord> = {
              status: "captured",
              updatedAt: new Date().toISOString()
            };
            transaction.set(paymentRef, paymentRecord, { merge: true });

            // C. Finalize Inventory (convert reserved to actual consumption)
            for (const item of order.items) {
              const variantRef = db
                .collection("products")
                .doc(item.productId)
                .collection("variants")
                .doc(item.variantId);
              
              const variantDoc = await transaction.get(variantRef);
              if (variantDoc.exists) {
                const variantData = variantDoc.data()!;
                const newAvailable = Math.max(0, (variantData.stockAvailable || 0) - item.quantity);
                const newReserved = Math.max(0, (variantData.stockReserved || 0) - item.quantity);
                
                transaction.update(variantRef, {
                  stockAvailable: newAvailable,
                  stockReserved: newReserved
                });
              }
            }
          });
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const paymentId = paymentIntent.id;
        const metadata = paymentIntent.metadata;
        const orderId = metadata?.orderId;
        
        if (orderId) {
          await adminDb.collection("payments").doc(paymentId).set({
            status: "failed",
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
        break;
      }
      // Add more event handlers (refunds, etc.) here
    }

    // Save event to prevent replay
    await eventRef.set({
      type: event.type,
      paymentId: (event.data.object as Stripe.PaymentIntent).id || null,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }
}

