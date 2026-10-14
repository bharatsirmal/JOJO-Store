// @vitest-environment node
import { beforeEach, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { paymentDb } from "./helpers/payment-db";
const m = vi.hoisted(() => ({
  db: null as any,
  user: vi.fn(),
  retrieve: vi.fn(),
}));
vi.mock("@/lib/firebase/admin", () => ({
  get adminDb() {
    return m.db;
  },
}));
vi.mock("@/lib/auth/server", () => ({ getCurrentUser: m.user }));
vi.mock("@/lib/payments/stripe", () => ({
  stripe: { paymentIntents: { retrieve: m.retrieve } },
}));
import { GET } from "../src/app/api/payments/status/route";
let rows: Map<string, any>;
const req = (query = "orderId=order1") =>
  new NextRequest(`http://localhost/api/payments/status?${query}`);
beforeEach(() => {
  vi.clearAllMocks();
  m.user.mockResolvedValue({ uid: "u1" });
  const store = paymentDb({
    "orders/order1": {
      customerId: "u1",
      status: "pending_payment",
      paymentIntentId: "pi_1",
      totalMinor: 10000,
      currency: "inr",
      items: [{ productId: "p", variantId: "v", quantity: 1 }],
    },
    "products/p/variants/v": { stockAvailable: 5, stockReserved: 1 },
  });
  rows = store.rows;
  m.db = store.db;
  m.retrieve.mockResolvedValue({
    id: "pi_1",
    status: "succeeded",
    amount: 10000,
    amount_received: 10000,
    currency: "inr",
    livemode: false,
    metadata: { orderId: "order1", customerId: "u1" },
  });
});
it("reconciles a successful payment if its webhook is delayed and cannot consume stock twice", async () => {
  const res = await GET(req());
  expect(await res.json()).toMatchObject({
    status: "confirmed",
    requiresReview: false,
  });
  expect(res.headers.get("Cache-Control")).toBe("private, no-store");
  await GET(req());
  expect(rows.get("products/p/variants/v").stockAvailable).toBe(4);
  expect(m.retrieve).toHaveBeenCalledTimes(1);
});
it("only exposes payment status to its owner", async () => {
  m.user.mockResolvedValue({ uid: "other" });
  expect((await GET(req())).status).toBe(404);
  expect(m.retrieve).not.toHaveBeenCalled();
  m.user.mockResolvedValue(null);
  expect((await GET(req())).status).toBe(401);
});
it("reports provider outages as pending verification, without claiming failure", async () => {
  m.retrieve.mockRejectedValue(Error("offline"));
  expect(await (await GET(req())).json()).toMatchObject({
    status: "payment_processing",
  });
  expect(rows.get("orders/order1").status).toBe("pending_payment");
});
it("preserves review flags and avoids contacting Stripe for those orders", async () => {
  rows.get("orders/order1").paymentReviewRequired = true;
  expect(await (await GET(req())).json()).toMatchObject({
    requiresReview: true,
  });
  expect(m.retrieve).not.toHaveBeenCalled();
});
it("returns retryable payment state without leaking a client secret", async () => {
  m.retrieve.mockResolvedValue({
    status: "requires_payment_method",
    client_secret: "private",
  });
  const data = await (await GET(req())).json();
  expect(data.paymentState).toBe("requires_payment_method");
  expect(data.client_secret).toBeUndefined();
});
