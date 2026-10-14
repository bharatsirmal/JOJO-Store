"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, RefreshCw, Search, CreditCard, Truck } from "lucide-react";
import type { Order } from "@/types";

export type CustomerOrder = Pick<
  Order,
  "id" | "items" | "totalMinor" | "currency" | "status" | "createdAt"
> & {
  paymentStatus: string;
  shipmentStatus: string | null;
  reservationExpiresAt: string | null;
};
const paid = new Set(["captured", "refunded", "partially_refunded"]);
const labels: Record<string, string> = {
  pending_payment: "Awaiting payment",
  payment_processing: "Payment processing",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  expired: "Expired",
  pending: "Awaiting confirmation",
  created: "Not paid",
  captured: "Paid",
  failed: "Payment failed",
  requires_review: "Needs review",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
  authorized: "Authorized",
  fulfillment_pending: "Preparing order",
  packing: "Packing",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};
const label = (value: string) => labels[value] || value.replaceAll("_", " ");
const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    value / 100,
  );

export function MyOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [revision, setRevision] = useState(0),
    [filter, setFilter] = useState("all"),
    [search, setSearch] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    async function load() {
      try {
        const response = await fetch("/api/account/orders", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok)
          throw Error(
            response.status === 401
              ? "Please sign in to view your orders."
              : "Unable to load your orders. Please try again.",
          );
        const data = await response.json();
        if (!controller.signal.aborted) setOrders(data.orders);
      } catch (err) {
        if (!controller.signal.aborted) setError((err as Error).message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [revision]);
  const query = search.trim().toLowerCase();
  const visible = orders.filter(
    (order) =>
      (filter === "all" ||
        (filter === "paid"
          ? paid.has(order.paymentStatus)
          : !paid.has(order.paymentStatus))) &&
      (!query ||
        order.id.toLowerCase().includes(query) ||
        order.items.some((item) =>
          item.productName.toLowerCase().includes(query),
        )),
  );
  return (
    <main className="min-h-[80dvh] bg-[#e7ebf0] px-4 py-8 sm:py-12 text-[#333333]">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#100c08]">
              My Orders
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Your purchases, payments and delivery updates
            </p>
          </div>
          <button
            onClick={() => setRevision((value) => value + 1)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Filter orders">
            {[
              ["all", "All orders"],
              ["paid", "Paid orders"],
              ["unpaid", "Other orders"],
            ].map(([value, text]) => (
              <button
                key={value}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${filter === value ? "bg-[#36454f] text-white" : "bg-white text-[#333333] border border-slate-200"}`}
              >
                {text}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              aria-label="Search orders"
              placeholder="Search products or order ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-0 w-full bg-transparent text-sm outline-none sm:w-56"
            />
          </label>
        </div>
        {loading ? (
          <p role="status" className="rounded-xl bg-white p-8 text-center">
            Loading your orders…
          </p>
        ) : error ? (
          <div role="alert" className="rounded-xl bg-white p-8 text-center">
            <p>{error}</p>
            <button
              className="mt-4 underline"
              onClick={() => setRevision((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        ) : !visible.length ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-[0_0_20px_rgba(0,0,0,0.07)]">
            <Package className="mx-auto mb-4 h-10 w-10 text-slate-400" />
            <h2 className="text-xl font-semibold">
              {orders.length ? "No matching orders" : "No orders yet"}
            </h2>
            <p className="my-3 text-sm text-slate-500">
              {orders.length
                ? "Try another search or filter."
                : "Your products and payment updates will appear here after checkout."}
            </p>
            <Link
              href="/products"
              className="inline-flex rounded-xl bg-[#36454f] px-5 py-3 text-sm text-white"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {visible.map((order) => {
              const canPay =
                order.status === "pending_payment" &&
                !paid.has(order.paymentStatus) &&
                order.paymentStatus !== "requires_review" &&
                !!order.reservationExpiresAt &&
                Date.parse(order.reservationExpiresAt) > Date.now();
              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_0_20px_rgba(0,0,0,0.07)]"
                >
                  <div className="flex flex-wrap justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                      <h2 className="break-all text-sm font-semibold">
                        Order #{order.id}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                      {label(order.status)}
                    </span>
                  </div>
                  <div className="space-y-4 p-5 sm:p-6">
                    {order.items.map((item, index) => (
                      <div
                        key={`${item.variantId}-${index}`}
                        className="flex items-start gap-4"
                      >
                        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {item.imagePath ? (
                            <Image
                              src={item.imagePath}
                              alt={item.productName}
                              fill
                              sizes="64px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <Package className="m-auto h-full w-7 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-sm font-semibold">
                            {item.productName}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {[item.size, item.color]
                              .filter(Boolean)
                              .join(" / ")}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Qty: {item.quantity}
                          </p>
                          <p className="mt-1 text-sm font-medium">
                            {money(item.unitPriceMinor * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/60 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                        <span className="inline-flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Payment: <strong>{label(order.paymentStatus)}</strong>
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          {order.shipmentStatus
                            ? label(order.shipmentStatus)
                            : "Shipment not started"}
                        </span>
                      </div>
                      <p className="text-sm">
                        Total: <strong>{money(order.totalMinor)}</strong>
                      </p>
                    </div>
                    {order.paymentStatus === "requires_review" && (
                      <p className="text-sm text-amber-800">
                        Contact the store to review this payment before paying
                        again.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/orders/${encodeURIComponent(order.id)}`}
                        className="rounded-xl bg-[#36454f] px-4 py-2 text-sm font-medium text-white"
                      >
                        View order
                      </Link>
                      <Link
                        href={`/orders/${encodeURIComponent(order.id)}/tracking`}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium"
                      >
                        Track order
                      </Link>
                      {canPay && (
                        <Link
                          href={`/payment/${encodeURIComponent(order.id)}`}
                          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium"
                        >
                          Check / complete payment
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
