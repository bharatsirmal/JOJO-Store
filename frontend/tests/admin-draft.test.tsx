import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
import { ProductForm } from "../src/components/admin/ProductForm";
import type { CatalogProduct } from "../src/types";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("Saving product drafts", () => {
  it("submits validated product data with draft status", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );
    const product = {
      id: "draft-test",
      name: "Valid shirt",
      slug: "valid-shirt",
      description: "A complete product description",
      categoryId: "men",
      basePriceMinor: 2500,
      currency: "USD",
      status: "active",
      imagePaths: [],
      featured: false,
      createdAt: "",
      updatedAt: "",
    } as CatalogProduct;
    render(<ProductForm productId={product.id} initialData={product} />);
    fireEvent.click(screen.getByRole("button", { name: "Save as Draft" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const payload = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(payload.status).toBe("draft");
    expect(payload.basePriceMinor).toBe(2500);
    expect(fetchMock.mock.calls[0][1]?.method).toBe("PUT");
  });
});
