import Stripe from "stripe";
import { Order } from "@/types";

// Ensure server-side only execution
if (typeof window !== "undefined") {
  throw new Error("Stripe secret key must not be exposed to the client.");
}

// Instantiate Stripe only if the key is available, preventing crash during build/lint in unconfigured environments
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-08-26.dahlia",
      appInfo: {
        name: "JOJO Store",
        version: "0.1.0",
      },
    })
  : null;

export async function createPaymentIntent(order: Order, idempotencyKey: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured in this environment.");
  }

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: order.totalMinor,
      currency: order.currency.toLowerCase(),
      // In a real app, attach customer metadata here
      metadata: {
        orderId: order.id,
        customerId: order.customerId,
      },
      // Optionally enable automatic payment methods
      automatic_payment_methods: {
        enabled: true,
      },
    },
    {
      idempotencyKey,
    }
  );

  return paymentIntent;
}
