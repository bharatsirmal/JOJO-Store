// @vitest-environment node
import { describe, it, expect } from "vitest";
import type Stripe from "stripe";
import { applyPaymentEvent } from "../src/lib/payments/events";
import { paymentDb } from "./helpers/payment-db";
const variant = "products/shirt/variants/s";
function fixture(overrides: Record<string, any> = {}) {
  return paymentDb({
    "orders/order1": {
      customerId: "u1",
      paymentIntentId: "pi_1",
      status: "pending_payment",
      totalMinor: 12300,
      currency: "inr",
      items: [{ productId: "shirt", variantId: "s", quantity: 2 }],
    },
    [variant]: { stockAvailable: 10, stockReserved: 3 },
    ...overrides,
  });
}
function event(
  id = "evt_1",
  type = "payment_intent.succeeded",
  overrides: Record<string, any> = {},
) {
  return {
    id,
    type,
    data: {
      object: {
        id: "pi_1",
        status: "succeeded",
        amount: 12300,
        amount_received: 12300,
        currency: "inr",
        metadata: { orderId: "order1", customerId: "u1" },
        ...overrides,
      },
    },
  } as Stripe.Event;
}
describe("Atomic payment finalization", () => {
  it("confirms payment and inventory once, with all reads before writes", async () => {
    const { db, rows } = fixture();
    expect(await applyPaymentEvent(db, event())).toBe("captured");
    expect(rows.get(variant)).toMatchObject({
      stockAvailable: 8,
      stockReserved: 1,
    });
    expect(rows.get("orders/order1")).toMatchObject({
      status: "confirmed",
      paymentIntentId: "pi_1",
    });
    expect(rows.get("payments/pi_1").status).toBe("captured");
    expect(await applyPaymentEvent(db, event())).toBe("duplicate");
    expect(rows.get(variant).stockAvailable).toBe(8);
  });
  it("handles concurrent deliveries and different event IDs without deducting twice", async () => {
    const { db, rows } = fixture();
    await Promise.all([
      applyPaymentEvent(db, event()),
      applyPaymentEvent(db, event("evt_2")),
    ]);
    rows.set("orders/order1", {
      ...rows.get("orders/order1"),
      status: "shipped",
    });
    await applyPaymentEvent(db, event("evt_3"));
    expect(rows.get(variant).stockAvailable).toBe(8);
    expect(rows.get("orders/order1").status).toBe("shipped");
  });
  it("allows a failed attempt to succeed and ignores a late failure", async () => {
    const { db, rows } = fixture();
    await applyPaymentEvent(
      db,
      event("failed", "payment_intent.payment_failed", {
        status: "requires_payment_method",
      }),
    );
    expect(rows.get(variant).stockReserved).toBe(3);
    expect(rows.get("payments/pi_1").status).toBe("failed");
    await applyPaymentEvent(db, event());
    await applyPaymentEvent(db, event("late", "payment_intent.payment_failed"));
    expect(rows.get("payments/pi_1").status).toBe("captured");
    expect(rows.get(variant).stockAvailable).toBe(8);
  });
  it.each([
    { amount: 12000 },
    { amount_received: 12000 },
    { currency: "usd" },
    { metadata: { orderId: "order1", customerId: "attacker" } },
    { id: "pi_other" },
  ])("requires review for a mismatched payment %j", async (overrides) => {
    const { db, rows } = fixture();
    expect(
      await applyPaymentEvent(db, event("evt", undefined, overrides)),
    ).toBe("requires_review");
    expect(rows.get(variant).stockAvailable).toBe(10);
    expect(rows.get("orders/order1")).toMatchObject({
      status: "pending_payment",
      paymentReviewRequired: true,
    });
  });
  it.each(["cancelled", "expired"])(
    "does not fulfil a %s order after delayed payment",
    async (status) => {
      const { db, rows } = fixture();
      rows.get("orders/order1").status = status;
      expect(await applyPaymentEvent(db, event())).toBe("requires_review");
      expect(rows.get(variant).stockAvailable).toBe(10);
    },
  );
  it("flags missing reserved stock rather than silently clamping stock", async () => {
    const { db, rows } = fixture({
      [variant]: { stockAvailable: 10, stockReserved: 1 },
    });
    expect(await applyPaymentEvent(db, event())).toBe("requires_review");
    expect(rows.get(variant).stockAvailable).toBe(10);
  });
  it("aggregates repeated variant rows before consuming inventory", async () => {
    const { db, rows } = fixture();
    rows.get("orders/order1").items = [
      { productId: "shirt", variantId: "s", quantity: 1 },
      { productId: "shirt", variantId: "s", quantity: 1 },
    ];
    await applyPaymentEvent(db, event());
    expect(rows.get(variant)).toMatchObject({
      stockAvailable: 8,
      stockReserved: 1,
    });
  });
  it("leaves no deduplication marker after a processing error so Stripe can retry", async () => {
    const { db, rows } = fixture();
    rows.delete("orders/order1");
    await expect(applyPaymentEvent(db, event())).rejects.toThrow(
      "order not found",
    );
    expect(rows.has("paymentEvents/evt_1")).toBe(false);
  });
  it("ignores unrelated events", async () => {
    const { db, rows } = fixture();
    expect(await applyPaymentEvent(db, event("evt", "charge.refunded"))).toBe(
      "ignored",
    );
    expect(rows.has("paymentEvents/evt")).toBe(false);
  });
});
