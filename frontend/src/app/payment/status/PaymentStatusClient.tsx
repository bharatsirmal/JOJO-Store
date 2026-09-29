"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export function PaymentStatusClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret");
  const [status, setStatus] = useState<"loading" | "succeeded" | "processing" | "requires_payment_method" | "default">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!paymentIntentClientSecret) {
      setStatus("default");
      return;
    }

    stripePromise.then(stripe => {
      if (!stripe) return;
      
      stripe.retrievePaymentIntent(paymentIntentClientSecret).then(({ paymentIntent }) => {
        if (!paymentIntent) {
          setStatus("default");
          return;
        }

        switch (paymentIntent.status) {
          case "succeeded":
            setStatus("succeeded");
            setMessage("Payment confirmed! Your order has been placed successfully.");
            break;
          case "processing":
            setStatus("processing");
            setMessage("Your payment is processing. We'll update you when payment is received.");
            break;
          case "requires_payment_method":
            setStatus("requires_payment_method");
            setMessage("Your payment was not successful, please try again.");
            break;
          default:
            setStatus("default");
            setMessage("Something went wrong.");
            break;
        }
      });
    });
  }, [paymentIntentClientSecret]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
        <p>Verifying payment status...</p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-xl p-8 max-w-md w-full shadow-sm border text-center">
      {status === "succeeded" && (
        <>
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful</h2>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button onClick={() => router.push("/orders")} className="w-full">View My Orders</Button>
        </>
      )}

      {status === "processing" && (
        <>
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Processing</h2>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button onClick={() => router.push("/orders")} className="w-full">View Order Status</Button>
        </>
      )}

      {(status === "requires_payment_method" || status === "default") && (
        <>
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button onClick={() => router.back()} variant="outline" className="w-full">Try Again</Button>
        </>
      )}
    </div>
  );
}
