import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../../frontend/src/middleware";
import { formatMoney } from "../src/lib/money";
import {
  adminProductSchema,
  productVariantOptions,
} from "../src/lib/admin/products";
const m = vi.hoisted(() => ({
  auth: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  query: vi.fn(),
  transaction: vi.fn(),
}));
vi.mock("@/lib/auth/server", () => ({ requireAdmin: m.auth }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("@/lib/firebase/admin", () => ({
  adminDb: {
    collection: (name: string) => ({
      doc: (id: string) => ({
        id,
        path: `${name}/${id}`,
        collection: () => ({
          path: `${name}/${id}/variants`,
          doc: (variantId: string) => ({
            id: variantId,
            path: `${name}/${id}/variants/${variantId}`,
          }),
        }),
      }),
      where: () => ({ limit: () => ({ get: m.query }), get: m.query }),
    }),
    runTransaction: m.transaction,
  },
}));
import { POST } from "../src/app/api/admin/products/route";
import { PUT, DELETE } from "../src/app/api/admin/products/[productId]/route";
const body = {
  name: "Test shirt",
  slug: "test-shirt",
  description: "A complete description",
  categoryId: "men",
  status: "active",
  basePriceMinor: 2500,
  offerPriceMinor: 2000,
  sizes: ["S", "M"],
  colorVariants: [{ colorName: "Blue", imagePaths: [] }],
  stockQuantity: 7,
};
function request(data = body) {
  return new Request("http://localhost/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  m.auth.mockResolvedValue({ uid: "admin" });
  m.query.mockResolvedValue({ empty: true, docs: [] });
  m.transaction.mockImplementation((fn) =>
    fn({ get: m.get, set: m.set, update: m.update, delete: m.delete }),
  );
});
describe("Product action endpoints", () => {
  it("creates INR variants using entered stock and offer price", async () => {
    m.get.mockResolvedValue({ exists: false });
    expect((await POST(request())).status).toBe(201);
    expect(m.set.mock.calls[0][1].currency).toBe("INR");
    expect(m.set.mock.calls[1][1]).toMatchObject({
      stockAvailable: 7,
      priceMinor: 2000,
      size: "S",
      color: "Blue",
    });
  });
  it("updates variant prices while preserving reservations and unchanged stock", async () => {
    const ref = { id: "v1", path: "products/test/variants/v1" };
    m.get
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ stockQuantity: 7 }),
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: "v1",
            ref,
            data: () => ({
              size: "S",
              color: "Blue",
              stockAvailable: 6,
              stockReserved: 2,
            }),
          },
        ],
      });
    expect(
      (await PUT(request(), { params: { productId: "test" } })).status,
    ).toBe(200);
    expect(m.set.mock.calls[0][1]).toMatchObject({
      stockAvailable: 6,
      stockReserved: 2,
      priceMinor: 2000,
    });
  });
  it("blocks removing reserved variants", async () => {
    m.get
      .mockResolvedValueOnce({ exists: true, data: () => ({}) })
      .mockResolvedValueOnce({
        docs: [
          {
            id: "v1",
            ref: { id: "v1" },
            data: () => ({ size: "XXL", color: "Blue", stockReserved: 2 }),
          },
        ],
      });
    expect(
      (await PUT(request(), { params: { productId: "test" } })).status,
    ).toBe(400);
    expect(m.update).not.toHaveBeenCalled();
  });
  it("removes child variants when deleting an unreserved product", async () => {
    const ref = { id: "v1" };
    m.get
      .mockResolvedValueOnce({ exists: true })
      .mockResolvedValueOnce({
        docs: [{ ref, data: () => ({ stockReserved: 0 }) }],
      });
    expect(
      (await DELETE(request(), { params: { productId: "test" } })).status,
    ).toBe(200);
    expect(m.delete).toHaveBeenCalledWith(ref);
    expect(m.delete).toHaveBeenCalledTimes(2);
  });
  it("blocks deletion while stock is reserved", async () => {
    m.get
      .mockResolvedValueOnce({ exists: true })
      .mockResolvedValueOnce({
        docs: [{ data: () => ({ stockReserved: 1 }) }],
      });
    expect(
      (await DELETE(request(), { params: { productId: "test" } })).status,
    ).toBe(400);
    expect(m.delete).not.toHaveBeenCalled();
  });
  it("rejects invalid stock and offer prices", () => {
    expect(
      adminProductSchema.safeParse({ ...body, stockQuantity: -1 }).success,
    ).toBe(false);
    expect(
      adminProductSchema.safeParse({ ...body, offerPriceMinor: 3000 }).success,
    ).toBe(false);
    expect(
      productVariantOptions(
        adminProductSchema.parse({ ...body, colorVariants: [], sizes: [] }),
      ),
    ).toHaveLength(1);
  });
});
describe("Staff navigation and INR", () => {
  const cookie = `a.${btoa(JSON.stringify({ role: "admin" }))}.b`;
  it("allows the logo asset and storefront for signed-in admins", async () => {
    for (const path of ["/jojo-store.svg", "/"]) {
      const result = await middleware(
        new NextRequest(`http://localhost${path}`, {
          headers: { cookie: `__session=${cookie}` },
        }),
      );
      expect(result.headers.get("location")).toBeNull();
    }
  });
  it("keeps protected admin routes guarded", async () => {
    const result = await middleware(new NextRequest("http://localhost/admin"));
    expect(result.headers.get("location")).toBe("http://localhost/admin-login");
  });
  it("formats the same price in rupees", () => {
    expect(formatMoney(217392)).toBe("₹2,173.92");
  });
});
