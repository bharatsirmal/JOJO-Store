// @vitest-environment node
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import Stripe from "stripe";
import { NextRequest } from "next/server";
const m = vi.hoisted(() => ({ apply: vi.fn() }));
vi.mock("@/lib/firebase/admin", () => ({ adminDb: {} }));
vi.mock("@/lib/payments/events", () => ({ applyPaymentEvent: m.apply }));
vi.mock("@/lib/payments/stripe", async () => {
  const { default: Stripe } = await import("stripe");
  return { stripe: new Stripe("sk_test_unit") };
});
import { POST } from "../src/app/api/webhooks/stripe/route";
const sdk = new Stripe("sk_test_unit"),
  secret = "whsec_unit";
const body = JSON.stringify({
  id: "evt_test",
  type: "payment_intent.succeeded",
  data: { object: { id: "pi_1" } },
});
function request(signature?: string, raw = body) {
  return new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: signature ? { "stripe-signature": signature } : {},
    body: raw,
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", secret);
  m.apply.mockResolvedValue("captured");
});
afterEach(() => vi.unstubAllEnvs());
it("verifies the raw signed payload using the real Stripe verifier", async () => {
  const signature = sdk.webhooks.generateTestHeaderString({
    payload: body,
    secret,
  });
  expect((await POST(request(signature))).status).toBe(200);
  expect(m.apply.mock.calls[0][1].id).toBe("evt_test");
});
it("rejects missing signatures and tampered payloads before database processing", async () => {
  expect((await POST(request())).status).toBe(400);
  const signature = sdk.webhooks.generateTestHeaderString({
    payload: body,
    secret,
  });
  expect((await POST(request(signature, body + " "))).status).toBe(400);
  expect(m.apply).not.toHaveBeenCalled();
});
it("returns 500 for a database failure so Stripe can retry, rather than a signature error", async () => {
  m.apply.mockRejectedValue(Error("database unavailable"));
  vi.spyOn(console, "error").mockImplementation(() => {});
  const signature = sdk.webhooks.generateTestHeaderString({
    payload: body,
    secret,
  });
  expect((await POST(request(signature))).status).toBe(500);
  vi.restoreAllMocks();
});
it("fails closed when the signing secret is absent", async () => {
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
  expect((await POST(request())).status).toBe(503);
  expect(m.apply).not.toHaveBeenCalled();
});
