import { describe, it, expect, vi, beforeEach } from "vitest";
import { salesMetrics } from "../src/lib/admin/metrics";
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  doc: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  set: vi.fn(),
  transaction: vi.fn(),
}));
vi.mock("@/lib/auth/server", () => ({ requireAdmin: mocks.auth }));
vi.mock("@/lib/firebase/admin", () => ({
  adminDb: {
    doc: mocks.doc,
    collection: () => ({ doc: () => ({ path: "inventory_audit/test" }) }),
    runTransaction: mocks.transaction,
  },
}));
import { POST } from "../src/app/api/admin/inventory/route";
function request(changes = {}) {
  return new Request("http://localhost/api/admin/inventory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      variantId: "medium",
      variantPath: "products/hoodie/variants/medium",
      adjustmentAmount: -1,
      reason: "Stock recount",
      ...changes,
    }),
  });
}
describe("Admin inventory adjustments", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.auth.mockResolvedValue({ uid: "admin" });
    mocks.doc.mockImplementation((path) => ({ path }));
    mocks.get.mockResolvedValue({
      exists: true,
      data: () => ({ stockAvailable: 5, stockReserved: 3 }),
    });
    mocks.transaction.mockImplementation((fn) =>
      fn({ get: mocks.get, update: mocks.update, set: mocks.set }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  it("adjusts the nested product variant and records an audit", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(mocks.doc).toHaveBeenCalledWith("products/hoodie/variants/medium");
    expect(mocks.update.mock.calls[0][1].stockAvailable).toBe(4);
    expect(mocks.set.mock.calls[0][1].variantPath).toBe(
      "products/hoodie/variants/medium",
    );
  });
  it("protects reserved stock", async () => {
    const response = await POST(request({ adjustmentAmount: -3 }));
    expect(response.status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it("rejects arbitrary document paths", async () => {
    expect(
      (await POST(request({ variantPath: "users/customer" }))).status,
    ).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("rejects a mismatched variant path", async () => {
    expect((await POST(request({ variantId: "large" }))).status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("requires administrator access", async () => {
    mocks.auth.mockRejectedValue(Error("Forbidden"));
    expect((await POST(request())).status).toBe(403);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
describe("Actual store sales", () => {
  it("includes completed and paid orders, excludes pending and refunded orders, and handles Firestore timestamps", () => {
    const metrics = salesMetrics([
      {
        status: "paid",
        totalMinor: 2500,
        createdAt: { toDate: () => new Date("2026-10-01") },
      },
      { status: "delivered", totalMinor: 1500, createdAt: "2026-10-01" },
      { status: "pending_payment", totalMinor: 9000, createdAt: "2026-10-01" },
      { status: "refunded", totalMinor: 8000, createdAt: "2026-10-01" },
      { status: "confirmed", totalMinor: 500, createdAt: "invalid" },
    ]);
    expect(metrics.revenueMinor).toBe(4500);
    expect(metrics.salesData).toEqual([
      { date: "2026-10-01", revenue: 40, orders: 2 },
    ]);
  });
});
