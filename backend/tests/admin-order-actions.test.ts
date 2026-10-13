import { describe, it, expect, vi, beforeEach } from "vitest";
const m = vi.hoisted(() => ({
  auth: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  set: vi.fn(),
  transaction: vi.fn(),
}));
vi.mock("@/lib/auth/server", () => ({ requireAdmin: m.auth }));
vi.mock("@/lib/firebase/admin", () => ({
  adminDb: {
    collection: (name: string) => ({
      doc: (id: string) => ({
        id,
        path: `${name}/${id}`,
        collection: (child: string) => ({
          doc: (v: string) => ({ path: `${name}/${id}/${child}/${v}` }),
        }),
      }),
    }),
    runTransaction: m.transaction,
  },
}));
import { PATCH } from "../src/app/api/admin/orders/[orderId]/route";
function request(status: string) {
  return new Request("http://localhost/api/admin/orders/test", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  m.auth.mockResolvedValue({ uid: "admin" });
  m.transaction.mockImplementation((fn) =>
    fn({ get: m.get, update: m.update, set: m.set }),
  );
});
describe("Manual order actions", () => {
  it("releases reservations on cancellation without consuming stock", async () => {
    m.get
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({
          status: "pending_payment",
          items: [{ productId: "shirt", variantId: "s", quantity: 2 }],
        }),
      })
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ stockAvailable: 10, stockReserved: 3 }),
      });
    expect(
      (await PATCH(request("cancelled"), { params: { orderId: "test" } }))
        .status,
    ).toBe(200);
    expect(m.update.mock.calls[0][1].stockReserved).toBe(1);
    expect(m.update.mock.calls[0][1].stockAvailable).toBeUndefined();
  });
  it("confirms an order and consumes reserved stock once", async () => {
    m.get
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({
          status: "payment_processing",
          items: [{ productId: "shirt", variantId: "s", quantity: 2 }],
        }),
      })
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ stockAvailable: 10, stockReserved: 3 }),
      });
    expect(
      (await PATCH(request("confirmed"), { params: { orderId: "test" } }))
        .status,
    ).toBe(200);
    expect(m.update.mock.calls[0][1]).toMatchObject({
      stockAvailable: 8,
      stockReserved: 1,
    });
  });
  it("makes repeated confirmation idempotent", async () => {
    m.get.mockResolvedValue({
      exists: true,
      data: () => ({ status: "confirmed" }),
    });
    expect(
      (await PATCH(request("confirmed"), { params: { orderId: "test" } }))
        .status,
    ).toBe(200);
    expect(m.update).not.toHaveBeenCalled();
  });
  it("rejects invalid transitions and customer access", async () => {
    m.get.mockResolvedValue({
      exists: true,
      data: () => ({ status: "delivered" }),
    });
    expect(
      (await PATCH(request("cancelled"), { params: { orderId: "test" } }))
        .status,
    ).toBe(400);
    m.auth.mockRejectedValue(Error("Forbidden"));
    expect(
      (await PATCH(request("confirmed"), { params: { orderId: "test" } }))
        .status,
    ).toBe(403);
    expect(m.update).not.toHaveBeenCalled();
  });
});
