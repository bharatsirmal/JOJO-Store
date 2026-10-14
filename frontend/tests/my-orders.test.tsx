import React from "react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { MyOrders } from "../src/components/MyOrders";
const fixture = [
  {
    id: "paid-order",
    items: [
      {
        productName: "Cotton Shirt",
        variantId: "s",
        size: "M",
        color: "Black",
        quantity: 2,
        unitPriceMinor: 10000,
      },
    ],
    status: "confirmed",
    paymentStatus: "captured",
    shipmentStatus: "delivered",
    totalMinor: 23100,
    currency: "inr",
    createdAt: "2026-01-01",
  },
  {
    id: "pending-order",
    items: [
      {
        productName: "Blue Jeans",
        variantId: "m",
        quantity: 1,
        unitPriceMinor: 20000,
      },
    ],
    status: "pending_payment",
    paymentStatus: "failed",
    shipmentStatus: null,
    totalMinor: 23100,
    currency: "inr",
    createdAt: "2026-01-02",
    reservationExpiresAt: "2099-01-01",
  },
];
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(Response.json({ orders: fixture }));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("shows purchased products, INR totals, payment and delivery statuses with working links", async () => {
  render(<MyOrders />);
  await screen.findByText("Cotton Shirt");
  expect(screen.getByText("Paid")).toBeTruthy();
  expect(screen.getByText("Delivered")).toBeTruthy();
  expect(screen.getAllByText("₹231.00")).toHaveLength(2);
  expect(
    screen.getAllByRole("link", { name: "View order" })[0].getAttribute("href"),
  ).toBe("/orders/paid-order");
  expect(
    screen
      .getAllByRole("link", { name: "Track order" })[0]
      .getAttribute("href"),
  ).toBe("/orders/paid-order/tracking");
  expect(
    screen
      .getByRole("link", { name: "Check / complete payment" })
      .getAttribute("href"),
  ).toBe("/payment/pending-order");
});
it("filters paid orders and searches by product or order ID", async () => {
  render(<MyOrders />);
  await screen.findByText("Cotton Shirt");
  fireEvent.click(screen.getByRole("button", { name: "Paid orders" }));
  expect(screen.queryByText("Blue Jeans")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "All orders" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Search orders" }), {
    target: { value: "pending-order" },
  });
  expect(screen.queryByText("Cotton Shirt")).toBeNull();
  expect(screen.getByText("Blue Jeans")).toBeTruthy();
});
it("does not offer another payment for orders requiring review or expired reservations", async () => {
  fetchMock.mockResolvedValue(
    Response.json({
      orders: [
        { ...fixture[1], paymentStatus: "requires_review" },
        { ...fixture[1], id: "old-order", reservationExpiresAt: "2000-01-01" },
      ],
    }),
  );
  render(<MyOrders />);
  await screen.findByText("Needs review");
  expect(
    screen.queryByRole("link", { name: "Check / complete payment" }),
  ).toBeNull();
});
it("shows an empty state when the customer has no orders", async () => {
  fetchMock.mockResolvedValue(Response.json({ orders: [] }));
  render(<MyOrders />);
  await screen.findByText("No orders yet");
  expect(
    screen
      .getByRole("link", { name: "Continue shopping" })
      .getAttribute("href"),
  ).toBe("/products");
});
it("lets the customer retry a failed load and refresh existing orders", async () => {
  fetchMock.mockRejectedValueOnce(Error("offline"));
  render(<MyOrders />);
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByText("Cotton Shirt");
  fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
});
