"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Result =
  | "loading"
  | "succeeded"
  | "processing"
  | "review"
  | "unknown"
  | "closed"
  | "retry";
export function PaymentStatusClient() {
  const params = useSearchParams(),
    router = useRouter();
  const orderId = params.get("orderId"),
    paymentId = params.get("payment_intent");
  const [resolvedId, setResolvedId] = useState(orderId);
  const [status, setStatus] = useState<Result>("loading");
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>,
      attempts = 0;
    setStatus("loading");
    async function check() {
      if (!orderId && !paymentId) {
        setStatus("unknown");
        return;
      }
      try {
        const query = orderId
          ? `orderId=${encodeURIComponent(orderId)}`
          : `paymentId=${encodeURIComponent(paymentId!)}`;
        const res = await fetch(`/api/payments/status?${query}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw Error("Cannot verify payment");
        const data = await res.json();
        if (controller.signal.aborted) return;
        setResolvedId(data.orderId);
        if (data.requiresReview) {
          setStatus("review");
          return;
        }
        if (
          ["confirmed", "paid", "processing", "shipped", "delivered"].includes(
            data.status,
          )
        ) {
          setStatus("succeeded");
          return;
        }
        if (["cancelled", "canceled", "expired"].includes(data.status)) {
          setStatus("closed");
          return;
        }
        if (data.paymentState === "requires_payment_method") {
          setStatus("retry");
          return;
        }
        setStatus("processing");
        if (++attempts < 20) timer = setTimeout(check, 1500);
      } catch {
        if (!controller.signal.aborted) setStatus("unknown");
      }
    }
    check();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [orderId, paymentId]);
  if (status === "loading")
    return (
      <div className="p-8 text-center" role="status">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
        Verifying payment status...
      </div>
    );
  const messages: Record<
    Exclude<Result, "loading">,
    { title: string; message: string }
  > = {
    succeeded: {
      title: "Payment Successful",
      message: "Your payment is confirmed and your order has been placed.",
    },
    processing: {
      title: "Awaiting Payment Confirmation",
      message:
        "We are checking your payment. If you have paid, do not pay again. You can check your order for updates.",
    },
    review: {
      title: "Payment Needs Review",
      message:
        "A payment was received but needs checking. Contact the store before paying again.",
    },
    unknown: {
      title: "Unable to Verify Payment",
      message:
        "We could not check your payment right now. Check your order before retrying.",
    },
    closed: {
      title: "Order Closed",
      message:
        "This checkout is cancelled or expired. If you were charged, contact the store before starting another checkout.",
    },
    retry: {
      title: "Payment Not Completed",
      message:
        "Your payment has not completed. You can return to the secure payment screen to try again.",
    },
  };
  const result = messages[status];
  return (
    <div
      className="bg-background rounded-xl p-8 max-w-md w-full shadow-sm border text-center"
      role="status"
    >
      {status === "succeeded" ? (
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
      ) : (
        <Clock className="w-16 h-16 text-amber-600 mx-auto mb-4" />
      )}
      <h2 className="text-2xl font-bold mb-2">{result.title}</h2>
      <p className="text-muted-foreground mb-6">{result.message}</p>
      {status === "retry" && resolvedId && (
        <Button
          className="w-full mb-3"
          onClick={() =>
            router.push(`/payment/${encodeURIComponent(resolvedId)}`)
          }
        >
          Retry Payment
        </Button>
      )}
      <Button
        className="w-full"
        onClick={() =>
          router.push(
            resolvedId
              ? `/orders/${encodeURIComponent(resolvedId)}`
              : "/account/orders",
          )
        }
      >
        View Order Status
      </Button>
    </div>
  );
}
