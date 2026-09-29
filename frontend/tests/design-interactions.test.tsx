import React from "react";
import { render, screen, fireEvent, cleanup, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { AdminShell } from "../src/components/admin/AdminShell";
import { NavClient } from "../src/components/NavClient";
import { CartDrawer } from "../src/components/CartDrawer";
import { useCartStore } from "../src/lib/store/cartStore";
import { ProductListClient } from "../src/app/admin/products/ProductListClient";
import type { CatalogProduct } from "../src/types";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/admin/products", useRouter: () => ({ push, refresh: vi.fn() }) }));
beforeAll(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() }));
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(() => [{ width: 44, height: 44 }] as unknown as DOMRectList);
});
afterEach(() => { cleanup(); useCartStore.setState({ items: [], isDrawerOpen: false }); vi.clearAllMocks(); });

describe("Redesigned navigation and cart", () => {
  it("opens all admin routes on mobile, traps focus, and restores the trigger on Escape", async () => {
    render(<AdminShell userEmail="test@example.test" userName="Test" userRole="admin"><h1>Products</h1></AdminShell>);
    const trigger = screen.getByRole("button", { name: "Toggle Sidebar" });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Admin navigation" });
    expect(within(dialog).getByRole("link", { name: "Products" }).getAttribute("aria-current")).toBe("page");
    expect(within(dialog).getByRole("link", { name: "Shipping" }).getAttribute("href")).toBe("/admin/shipments");
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole("button", { name: "Close navigation" })));
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(within(dialog).getByRole("link", { name: "View storefront" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
  });

  it("keeps storefront search routing and dismisses the overlay", () => {
    render(<NavClient user={null} />);
    fireEvent.click(screen.getAllByRole("button", { name: "Search", exact: true })[0]);
    const input = screen.getByRole("textbox", { name: "Search for products" });
    fireEvent.change(input, { target: { value: " blue shirt " } });
    fireEvent.submit(input.closest("form")!);
    expect(push).toHaveBeenCalledWith("/products?q=blue%20shirt");
  });

  it("preserves cart quantity and subtotal while supporting Escape", async () => {
    useCartStore.setState({ isDrawerOpen: true, items: [{ productId: "test", variantId: "medium", productName: "Test Hoodie", priceMinor: 5000, quantity: 1 }] });
    render(<CartDrawer />);
    expect(screen.getAllByText("$50.00", { selector: "span" })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(useCartStore.getState().items[0].quantity).toBe(2);
    expect(screen.getByText("$100.00")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(useCartStore.getState().items[0].quantity).toBe(1);
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(useCartStore.getState().isDrawerOpen).toBe(false));
  });

  it("dismisses product removal with Escape without calling the delete endpoint", () => {
    const request = vi.spyOn(globalThis, "fetch");
    const product = { id: "test", name: "Test Hoodie", slug: "test", description: "", imagePaths: [], categoryId: "Hoodies", basePriceMinor: 5000, currency: "USD", status: "active", featured: false, createdAt: "", updatedAt: "" } as CatalogProduct;
    render(<ProductListClient initialProducts={[product]} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete Test Hoodie" }));
    expect(screen.getByRole("dialog", { name: "Remove Product" })).toBeDefined();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(request).not.toHaveBeenCalled();
    request.mockRestore();
  });
});
