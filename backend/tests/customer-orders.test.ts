// @vitest-environment node
import { beforeEach, it, expect, vi } from "vitest";
const m = vi.hoisted(() => ({
  user: vi.fn(),
  query: vi.fn(),
  rows: {} as Record<string, any[]>,
}));
vi.mock("@/lib/auth/server", () => ({ getCurrentUser: m.user }));
vi.mock("@/lib/firebase/admin", () => ({
  adminDb: {
    collection: (name: string) => ({
      where: (field: string, op: string, value: any) => ({
        get: async () => {
          m.query(name, field, op, value);
          return {
            docs: (m.rows[name] || [])
              .filter((row) =>
                op === "in" ? value.includes(row[field]) : row[field] === value,
              )
              .map((row) => ({ id: row.id, data: () => row })),
          };
        },
      }),
    }),
  },
}));
import { GET } from "../src/app/api/account/orders/route";
beforeEach(() => {
  vi.clearAllMocks();
  m.user.mockResolvedValue({ uid: "u1" });
  m.rows = {
    orders: [
      {
        id: "first",
        customerId: "u1",
        createdAt: "2026-01-01",
        status: "confirmed",
        items: [{ productName: "Shirt" }],
        totalMinor: 10000,
        currency: "inr",
        shippingAddress: { phone: "private" },
      },
      {
        id: "second",
        customerId: "u1",
        createdAt: "2026-02-01",
        status: "pending_payment",
        items: [],
        totalMinor: 10000,
        currency: "inr",
      },
      { id: "other", customerId: "u2", items: [] },
    ],
    payments: [
      {
        orderId: "first",
        customerId: "u1",
        status: "captured",
        updatedAt: "2026-01-02",
        providerPaymentReference: "pi_private",
      },
      { orderId: "other", customerId: "u2", status: "captured" },
    ],
    shipments: [
      { orderId: "first", status: "delivered", updatedAt: "2026-01-03" },
    ],
  };
});
it("requires login before reading order or payment history", async () => {
  m.user.mockResolvedValue(null);
  expect((await GET()).status).toBe(401);
  expect(m.query).not.toHaveBeenCalled();
});
it("returns only the signed-in customer's products and payment history, newest first", async () => {
  const res = await GET(),
    { orders } = await res.json();
  expect(orders.map((o: any) => o.id)).toEqual(["second", "first"]);
  expect(orders[1]).toMatchObject({
    items: [{ productName: "Shirt" }],
    paymentStatus: "captured",
    shipmentStatus: "delivered",
    totalMinor: 10000,
  });
  expect(m.query).toHaveBeenCalledWith("orders", "customerId", "==", "u1");
  expect(m.query).toHaveBeenCalledWith("payments", "customerId", "==", "u1");
  expect(m.query).toHaveBeenCalledWith("shipments", "orderId", "in", [
    "first",
    "second",
  ]);
  expect(JSON.stringify(orders)).not.toContain("pi_private");
  expect(JSON.stringify(orders)).not.toContain("private");
  expect(res.headers.get("Cache-Control")).toBe("private, no-store");
});
it("shows refunds from the latest payment update and keeps review flags visible", async () => {
  m.rows.payments.push({
    orderId: "first",
    customerId: "u1",
    status: "refunded",
    updatedAt: "2026-03-01",
  });
  m.rows.orders[1].paymentReviewRequired = true;
  const { orders } = await (await GET()).json();
  expect(orders[0].paymentStatus).toBe("requires_review");
  expect(orders[1].paymentStatus).toBe("refunded");
});
it("returns an empty history without querying shipment data for another customer", async () => {
  m.rows.orders = [];
  const { orders } = await (await GET()).json();
  expect(orders).toEqual([]);
  expect(m.query.mock.calls.some((call) => call[0] === "shipments")).toBe(
    false,
  );
});
