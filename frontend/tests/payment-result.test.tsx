import React from "react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
const m = vi.hoisted(() => ({
  push: vi.fn(),
  params: new URLSearchParams("orderId=order1&redirect_status=succeeded"),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: m.push }),
  useSearchParams: () => m.params,
}));
import { PaymentStatusClient } from "../src/components/PaymentResult";
beforeEach(() => {
  vi.clearAllMocks();
  m.params = new URLSearchParams("orderId=order1&redirect_status=succeeded");
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it("shows success only after backend confirmation and links to the actual order", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ orderId: "order1", status: "confirmed" }),
      ),
  );
  render(<PaymentStatusClient />);
  await screen.findByText("Payment Successful");
  fireEvent.click(screen.getByRole("button", { name: "View Order Status" }));
  expect(m.push).toHaveBeenCalledWith("/orders/order1");
});
it("does not trust redirect_status=succeeded while the order is pending", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ orderId: "order1", status: "pending_payment" }),
      ),
  );
  render(<PaymentStatusClient />);
  await screen.findByText("Awaiting Payment Confirmation");
  expect(screen.queryByText("Payment Successful")).toBeNull();
});
it("polls a pending order until the backend confirms it", async () => {
  vi.useFakeTimers();
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      Response.json({ orderId: "order1", status: "pending_payment" }),
    )
    .mockResolvedValueOnce(
      Response.json({ orderId: "order1", status: "confirmed" }),
    );
  vi.stubGlobal("fetch", fetch);
  render(<PaymentStatusClient />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1500);
  });
  expect(screen.getByText("Payment Successful")).toBeTruthy();
  expect(fetch).toHaveBeenCalledTimes(2);
});
it("shows a review message instead of inviting another payment", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({
          orderId: "order1",
          status: "pending_payment",
          requiresReview: true,
        }),
      ),
  );
  render(<PaymentStatusClient />);
  await screen.findByText("Payment Needs Review");
  expect(screen.queryByText("Payment Successful")).toBeNull();
  expect(screen.getByText(/before paying again/)).toBeTruthy();
});
it("does not describe a network failure as a failed payment", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(Error("offline")));
  render(<PaymentStatusClient />);
  await screen.findByText("Unable to Verify Payment");
  expect(screen.queryByText("Payment Failed")).toBeNull();
});
