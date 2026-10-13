import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
const m = vi.hoisted(() => ({
  refresh: vi.fn(),
  push: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: m.refresh, push: m.push }),
}));
vi.mock("sonner", () => ({
  toast: {
    success: m.success,
    error: m.error,
    loading: vi.fn(),
    info: vi.fn(),
  },
}));
import { ProductForm } from "../src/components/admin/ProductForm";
import { ShipmentDetailClient } from "../src/components/admin/ShipmentDetailClient";
import { CustomerActions } from "../src/app/admin/customers/CustomerActions";
import { CustomerProfileActions } from "../src/app/admin/customers/[userId]/CustomerProfileActions";
import { ProfileEditModal } from "../src/components/admin/ProfileEditModal";
import OrderDetailActions from "../src/app/admin/orders/[orderId]/OrderDetailActions";
import type { Order, Shipment } from "../src/types";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});
const order = {
  id: "order-test",
  items: [
    {
      productId: "shirt",
      variantId: "small",
      productName: "Test shirt",
      quantity: 1,
      size: "S",
      color: "Blue",
    },
  ],
  shippingAddress: { fullName: "Test" },
} as Order;
const shipment = {
  id: "shipment-test",
  status: "packing",
  orderId: order.id,
} as Shipment;
describe("Admin section controls", () => {
  it("adds a custom size through the button and removes it", () => {
    render(<ProductForm />);
    fireEvent.change(screen.getByLabelText("Custom size"), {
      target: { value: "3XL" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Custom" }));
    const size = screen.getByRole("checkbox", { name: "3XL" });
    expect(size).toBeDefined();
    fireEvent.click(size);
    expect(screen.queryByRole("checkbox", { name: "3XL" })).toBeNull();
  });
  it("uploads selected product images before saving their returned URLs", async () => {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:test"),
    });
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(
        async (url) =>
          new Response(
            JSON.stringify(
              String(url).includes("upload")
                ? { urls: ["https://res.cloudinary.com/test/image.jpg"] }
                : { success: true },
            ),
            { status: 200 },
          ),
      );
    const product = {
      id: "shirt",
      name: "Test shirt",
      slug: "test-shirt",
      description: "Complete description",
      categoryId: "men",
      basePriceMinor: 2500,
      status: "active",
      currency: "INR",
      featured: false,
      imagePaths: [],
      createdAt: "",
      updatedAt: "",
    } as import("../src/types").CatalogProduct;
    render(<ProductForm initialData={product} productId={product.id} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Black, White, Blue"), {
      target: { value: "Blue" },
    });
    fireEvent.change(screen.getByLabelText("Upload product images"), {
      target: {
        files: [new File(["image"], "test.png", { type: "image/png" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update Product" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(
      JSON.parse(String(fetchMock.mock.calls[1][1]?.body)).imagePaths,
    ).toEqual(["https://res.cloudinary.com/test/image.jpg"]);
  });
  it("requires every packing checkbox before marking a shipment ready", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ success: true })));
    render(<ShipmentDetailClient shipment={shipment} order={order} />);
    const button = screen.getByRole("button", {
      name: "Mark as Ready for Shipping",
    });
    expect(button.hasAttribute("disabled")).toBe(true);
    fireEvent.keyDown(screen.getByRole("checkbox"), { key: "Enter" });
    fireEvent.click(button);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).action).toBe(
      "mark_ready",
    );
  });
  it("assigns the selected delivery partner through an explicit action", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ success: true })));
    render(
      <ShipmentDetailClient
        shipment={{ ...shipment, status: "ready_for_shipping" }}
        order={order}
        deliveryPartners={[{ id: "partner", email: "partner@example.test" }]}
      />,
    );
    fireEvent.change(screen.getByLabelText("Delivery partner"), {
      target: { value: "partner" },
    });
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Assign delivery partner" }),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      action: "assign",
      partnerId: "partner",
    });
  });
  it("approves a delivery applicant and refreshes", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ success: true })));
    render(<CustomerActions userId="applicant" role="delivery_pending" />);
    fireEvent.click(screen.getByRole("button", { name: "Approve Delivery" }));
    await waitFor(() => expect(m.refresh).toHaveBeenCalled());
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).targetUid).toBe(
      "applicant",
    );
  });
  it("opens and dismisses customer messaging and provides an email-app link", () => {
    render(
      <CustomerProfileActions
        userId="customer"
        email="customer@example.test"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Message" }));
    fireEvent.change(screen.getByLabelText("Message subject"), {
      target: { value: "Order update" },
    });
    expect(
      screen.getByRole("link", { name: "Open email app" }).getAttribute("href"),
    ).toContain("subject=Order%20update");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("shows delivery links for orders already being processed", () => {
    render(
      <OrderDetailActions
        orderId="order"
        currentStatus={"processing" as Order["status"]}
      />,
    );
    expect(
      screen.getByRole("link", { name: "View shipping" }).getAttribute("href"),
    ).toBe("/admin/shipments");
  });
  it("loads and preserves the admin phone number when saving the profile", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(
        async (_url, options) =>
          new Response(
            JSON.stringify(
              options?.method === "PATCH"
                ? { success: true }
                : { phoneNumber: "+919876543210" },
            ),
            { status: 200 },
          ),
      );
    render(
      <ProfileEditModal
        isOpen
        onClose={vi.fn()}
        currentName="Admin"
        currentEmail="admin@example.test"
      />,
    );
    await waitFor(() =>
      expect(
        (screen.getByLabelText("Mobile number") as HTMLInputElement).value,
      ).toBe("+919876543210"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save Profile" }));
    await waitFor(() => expect(m.refresh).toHaveBeenCalled());
    const save = fetchMock.mock.calls.find(
      ([, options]) => options?.method === "PATCH",
    );
    expect(JSON.parse(String(save?.[1]?.body)).phoneNumber).toBe(
      "+919876543210",
    );
  });
});
