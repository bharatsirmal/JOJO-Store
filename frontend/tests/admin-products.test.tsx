import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
import { ProductListClient } from "../src/app/admin/products/ProductListClient";
import type { CatalogProduct } from "../src/types";
afterEach(cleanup);
const products = Array.from(
  { length: 12 },
  (_, i) =>
    ({
      id: String(i),
      name: `Product ${String(i).padStart(2, "0")}`,
      slug: `product-${i}`,
      categoryId: i < 6 ? "Shirts" : "Hoodies",
      status: i < 9 ? "active" : "draft",
      basePriceMinor: 1000,
      currency: "USD",
      imagePaths: [],
      createdAt: "2026-10-01",
      updatedAt: "2026-10-01",
      description: "",
      featured: false,
    }) as CatalogProduct,
);
describe("Product management", () => {
  it("paginates and filters actual rows", () => {
    render(<ProductListClient initialProducts={products} />);
    expect(screen.queryByText("Product 10")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Product 10")).toBeDefined();
    fireEvent.change(screen.getByLabelText("Product category"), {
      target: { value: "Hoodies" },
    });
    expect(screen.queryByText("Product 00")).toBeNull();
    expect(screen.getByText("Product 06")).toBeDefined();
    fireEvent.change(screen.getByLabelText("Product status"), {
      target: { value: "draft" },
    });
    expect(screen.queryByText("Product 06")).toBeNull();
    expect(screen.getByText("Product 09")).toBeDefined();
    fireEvent.change(screen.getByRole("textbox", { name: "Search products" }), {
      target: { value: "product-11" },
    });
    expect(screen.getByText("Product 11")).toBeDefined();
    expect(screen.queryByText("Product 09")).toBeNull();
  });
});
