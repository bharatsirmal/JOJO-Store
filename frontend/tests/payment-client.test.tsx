import React from "react";
import { beforeEach, afterEach, afterAll, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
const m = vi.hoisted(() => {
  const originalKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_unit";
  return {
    originalKey,
    replace: vi.fn(),
    confirm: vi.fn(),
    error: vi.fn(),
    elements: {},
    router: null as any,
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => m.router }));
vi.mock("@stripe/stripe-js", () => ({ loadStripe: () => Promise.resolve({}) }));
vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }: any) => <div>{children}</div>,
  PaymentElement: () => <div>Payment Methods</div>,
  useStripe: () => ({ confirmPayment: m.confirm }),
  useElements: () => m.elements,
}));
vi.mock("sonner", () => ({ toast: { loading: vi.fn(), error: m.error } }));
import { PaymentClient } from "../src/app/payment/[orderId]/PaymentClient";
const order = {
  id: "order1",
  items: [],
  subtotalMinor: 10000,
  shippingMinor: 1500,
  taxMinor: 800,
  totalMinor: 12300,
} as any;
beforeEach(() => {
  vi.clearAllMocks();
  m.router = { replace: m.replace };
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({ clientSecret: "unit_secret" })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
afterAll(() => {
  if (m.originalKey === undefined)
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  else process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = m.originalKey;
});
it("includes the order ID in Stripe's return URL", async () => {
  m.confirm.mockResolvedValue({ error: { message: "Card declined" } });
  render(<PaymentClient order={order} />);
  const pay = await screen.findByRole("button", { name: /Pay ₹123.00/ });
  fireEvent.click(pay);
  await waitFor(() => expect(m.confirm).toHaveBeenCalled());
  expect(m.confirm.mock.calls[0][0].confirmParams.return_url).toBe(
    `${window.location.origin}/payment/status?orderId=order1`,
  );
  await waitFor(() =>
    expect(m.error).toHaveBeenCalledWith("Card declined", expect.anything()),
  );
});
it("re-enables payment after a network exception and tells users to check their order", async () => {
  m.confirm.mockRejectedValue(Error("offline"));
  render(<PaymentClient order={order} />);
  fireEvent.click(await screen.findByRole("button", { name: /Pay ₹123.00/ }));
  await waitFor(() =>
    expect(m.error).toHaveBeenCalledWith(
      expect.stringContaining("Check your order"),
      expect.anything(),
    ),
  );
  expect(
    (screen.getByRole("button", { name: /Pay ₹123.00/ }) as HTMLButtonElement)
      .disabled,
  ).toBe(false);
});
it("redirects processing payments to status instead of displaying another payment form", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ orderUrl: "/payment/status?orderId=order1" }),
      ),
  );
  render(<PaymentClient order={order} />);
  await waitFor(() =>
    expect(m.replace).toHaveBeenCalledWith("/payment/status?orderId=order1"),
  );
  expect(screen.queryByText("Payment Methods")).toBeNull();
});
