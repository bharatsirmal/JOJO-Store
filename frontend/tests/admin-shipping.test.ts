import { describe, it, expect, vi, beforeEach } from "vitest";
const m = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  transaction: vi.fn(),
}));
vi.mock("@/lib/firebase/admin", () => ({
  adminDb: {
    collection: (name: string) => ({
      doc: (id: string) => ({ id, path: `${name}/${id}` }),
      where: () => ({ path: name, limit: () => ({ path: name }) }),
    }),
    runTransaction: m.transaction,
  },
}));
import { ShipmentService } from "../src/lib/delivery/shipment-service";
beforeEach(() => {
  vi.resetAllMocks();
  m.transaction.mockImplementation((fn) =>
    fn({ get: m.get, set: m.set, update: m.update }),
  );
});
describe("Shipping actions", () => {
  it("creates a single fulfillment task and updates its order in one transaction", async () => {
    m.get
      .mockResolvedValueOnce({ empty: true, docs: [] })
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({
          status: "confirmed",
          shippingAddress: { fullName: "Customer" },
        }),
      });
    const result = await ShipmentService.createFulfillmentTask("order");
    expect(result.id).toBe("order");
    expect(m.set).toHaveBeenCalledTimes(1);
    expect(m.update.mock.calls[0][1].status).toBe("processing");
  });
  it("returns an existing shipment on repeat clicks even after the order starts processing", async () => {
    m.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: "existing",
          data: () => ({ orderId: "order", status: "packing" }),
        },
      ],
    });
    expect((await ShipmentService.createFulfillmentTask("order")).id).toBe(
      "existing",
    );
    expect(m.set).not.toHaveBeenCalled();
  });
  it("rejects an unapproved courier", async () => {
    m.get
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ status: "ready_for_shipping" }),
      })
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ role: "customer" }),
      })
      .mockResolvedValueOnce({ docs: [] });
    await expect(
      ShipmentService.assignDeliveryPartner("shipment", "customer"),
    ).rejects.toThrow("approved delivery partner");
    expect(m.set).not.toHaveBeenCalled();
  });
  it("assigns an approved partner atomically", async () => {
    m.get
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ status: "ready_for_shipping" }),
      })
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ role: "delivery_partner" }),
      })
      .mockResolvedValueOnce({ docs: [] });
    const result = await ShipmentService.assignDeliveryPartner(
      "shipment",
      "partner",
    );
    expect(result.deliveryPartnerId).toBe("partner");
    expect(m.update.mock.calls[0][1].status).toBe("pickup_scheduled");
  });
});
