// @vitest-environment node
import { beforeEach, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { paymentDb } from "./helpers/payment-db";
const m = vi.hoisted(() => ({
  db: null as any,
  auth: vi.fn(),
  intent: vi.fn(),
}));
vi.mock("@/lib/firebase/admin", () => ({
  get adminDb() {
    return m.db;
  },
  adminAuth: { verifySessionCookie: m.auth },
}));
vi.mock("@/lib/payments/stripe", () => ({ createPaymentIntent: m.intent }));
import {
  quoteCheckout,
  createOrder,
} from "../src/lib/payments/checkout-handlers";
import { paymentSession } from "../src/lib/payments/session-handler";
const item = { productId: "shirt", variantId: "s", quantity: 2 };
const shippingAddress = {
  fullName: "Test Customer",
  phone: "9999999999",
  addressLine1: "Street 1",
  city: "Mumbai",
  postalCode: "400001",
  countryCode: "IN",
};
let rows: Map<string, any>;
function request(body: any, cookie = true) {
  return new NextRequest("http://localhost/api/test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie: "__session=test" } : {}),
    },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  m.auth.mockResolvedValue({ uid: "u1" });
  const store = paymentDb({
    "products/shirt": {
      name: "Shirt",
      status: "active",
      basePriceMinor: 10000,
    },
    "products/shirt/variants/s": { stockAvailable: 10, stockReserved: 0 },
  });
  m.db = store.db;
  rows = store.rows;
  m.intent.mockResolvedValue({
    id: "pi_1",
    status: "requires_payment_method",
    amount: 23100,
    currency: "inr",
    client_secret: "unit_test_secret",
    metadata: { orderId: "order1", customerId: "u1" },
  });
});
it("uses identical authoritative INR totals for quote and order", async () => {
  const quote = await (
    await quoteCheckout(request({ items: [{ ...item, priceMinor: 1 }] }))
  ).json();
  const result = await createOrder(
    request({ items: [item], shippingAddress, idempotencyKey: "order1" }),
  );
  expect(result.status).toBe(200);
  expect(quote).toMatchObject({
    subtotalMinor: 20000,
    shippingMinor: 1500,
    taxMinor: 1600,
    totalMinor: 23100,
    currency: "inr",
  });
  expect(rows.get("orders/order1")).toMatchObject({
    ...Object.fromEntries(
      [
        "subtotalMinor",
        "shippingMinor",
        "taxMinor",
        "totalMinor",
        "currency",
      ].map((k) => [k, quote[k]]),
    ),
    id: "order1",
  });
});
it("groups duplicate cart rows and reserves only once on network retries", async () => {
  const body = {
    items: [item, item],
    shippingAddress,
    idempotencyKey: "order1",
  };
  expect((await createOrder(request(body))).status).toBe(200);
  expect((await createOrder(request(body))).status).toBe(200);
  expect(rows.get("products/shirt/variants/s").stockReserved).toBe(4);
  expect(rows.get("orders/order1").items).toHaveLength(1);
});
it.each([0, -1, 1.5, 100])("rejects invalid quantity %s", async (quantity) => {
  expect(
    (await quoteCheckout(request({ items: [{ ...item, quantity }] }))).status,
  ).toBe(400);
});
it("rejects the entire cart when one item is missing or archived", async () => {
  expect(
    (
      await quoteCheckout(
        request({ items: [item, { ...item, productId: "missing" }] }),
      )
    ).status,
  ).toBe(409);
  rows.get("products/shirt").status = "archived";
  expect(
    (
      await createOrder(
        request({ items: [item], shippingAddress, idempotencyKey: "order1" }),
      )
    ).status,
  ).toBe(409);
  expect(rows.get("products/shirt/variants/s").stockReserved).toBe(0);
});
it("rejects another customer's idempotency key and unauthenticated checkout", async () => {
  rows.set("orders/order1", { customerId: "other" });
  expect(
    (
      await createOrder(
        request({ items: [item], shippingAddress, idempotencyKey: "order1" }),
      )
    ).status,
  ).toBe(403);
  expect((await quoteCheckout(request({ items: [item] }, false))).status).toBe(
    401,
  );
});
async function order() {
  await createOrder(
    request({ items: [item], shippingAddress, idempotencyKey: "order1" }),
  );
}
it("binds Stripe to the order and preserves existing payment records on retries", async () => {
  await order();
  expect((await paymentSession(request({ orderId: "order1" }))).status).toBe(
    200,
  );
  expect(rows.get("orders/order1").paymentIntentId).toBe("pi_1");
  rows.get("payments/pi_1").status = "failed";
  await paymentSession(request({ orderId: "order1" }));
  expect(rows.get("payments/pi_1").status).toBe("failed");
  expect(m.intent.mock.calls[0][1]).toBe("intent_order1");
});
it.each(["expired", "other-owner", "usd", "review"])(
  "blocks an ineligible %s checkout before contacting Stripe",
  async (kind) => {
    await order();
    const o = rows.get("orders/order1");
    if (kind === "expired") o.reservationExpiresAt = "2000-01-01";
    if (kind === "other-owner") o.customerId = "other";
    if (kind === "usd") o.currency = "usd";
    if (kind === "review") o.paymentReviewRequired = true;
    expect((await paymentSession(request({ orderId: "order1" }))).status).toBe(
      kind === "other-owner" ? 403 : 409,
    );
    expect(m.intent).not.toHaveBeenCalled();
  },
);
it("rechecks cancellation after the Stripe request before exposing a client secret", async () => {
  await order();
  m.intent.mockImplementation(async () => {
    rows.get("orders/order1").status = "cancelled";
    return {
      id: "pi_1",
      status: "requires_payment_method",
      amount: 23100,
      currency: "inr",
      client_secret: "secret",
      metadata: { orderId: "order1", customerId: "u1" },
    };
  });
  const res = await paymentSession(request({ orderId: "order1" }));
  expect(res.status).toBe(409);
  expect((await res.json()).clientSecret).toBeUndefined();
});
it("redirects an already processing payment to verification instead of charging again", async () => {
  await order();
  m.intent.mockResolvedValue({ ...(await m.intent()), status: "processing" });
  const data = await (
    await paymentSession(request({ orderId: "order1" }))
  ).json();
  expect(data.orderUrl).toBe("/payment/status?orderId=order1");
  expect(data.clientSecret).toBeUndefined();
});
