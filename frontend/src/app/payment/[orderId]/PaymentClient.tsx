"use client";

import { useEffect, useState } from "react";
import { Order } from "@/types";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";

// Load Stripe outside of component to avoid recreating the object
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export function PaymentClient({ order }: { order: Order }) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initPayment() {
      try {
        const res = await fetch("/api/payments/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id })
        });
        const data = await res.json();
        
        if (res.ok && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || "Failed to initialize payment.");
        }
      } catch {
        setError("Network error initializing payment.");
      }
    }
    initPayment();
  }, [order.id]);

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20 text-center">
        <h2 className="text-lg font-bold mb-2">Payment Unavailable</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
        <p>Preparing secure payment environment...</p>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#000000',
      colorBackground: '#ffffff',
      colorText: '#000000',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '6px',
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Order Summary */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-5 bg-background p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-bold mb-6">Order Summary</h2>
        <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto no-scrollbar pr-2">
          {order.items.map(item => (
             <div key={`${item.productId}-${item.variantId}`} className="flex justify-between items-start text-sm">
               <div>
                 <p className="font-medium line-clamp-1">{item.quantity}x {item.productName}</p>
                 <p className="text-muted-foreground">{item.size} {item.color}</p>
               </div>
               <p className="font-medium">${((item.unitPriceMinor * item.quantity) / 100).toFixed(2)}</p>
             </div>
          ))}
        </div>
        <div className="border-t pt-4 space-y-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>${(order.subtotalMinor / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>${(order.shippingMinor / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span>${(order.taxMinor / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold border-t pt-3 mt-3">
            <span>Total to Pay</span>
            <span>${(order.totalMinor / 100).toFixed(2)}</span>
          </div>
        </div>
      </motion.div>

      {/* Payment Element */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-7 bg-background p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-xl font-bold">
          <CreditCard className="w-5 h-5" /> Secure Payment
        </div>
        
        <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
          <PaymentForm orderId={order.id} totalMinor={order.totalMinor} />
        </Elements>
      </motion.div>
    </div>
  );
}

function PaymentForm({ totalMinor }: { orderId: string, totalMinor: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    toast.loading("Verifying your payment...", { id: "payment-toast" });

    // The return_url is required. It's where Stripe redirects after payment.
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${baseUrl}/payment/status`,
      },
    });

    // This point is only reached if there's an immediate error (like card declined).
    // Otherwise it redirects.
    if (error) {
      toast.error(error.message || "Payment was unsuccessful. Please try again.", { id: "payment-toast" });
    } else {
      toast.error("An unexpected error occurred.", { id: "payment-toast" });
    }
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />
      <Button 
        type="submit" 
        size="lg" 
        className="w-full h-14 text-base mt-6"
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing Payment...</>
        ) : (
          <><ShieldCheck className="w-5 h-5 mr-2" /> Pay ${(totalMinor / 100).toFixed(2)}</>
        )}
      </Button>
      <div className="text-center">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-4">
          <ShieldCheck className="w-3 h-3" /> Payments are secure and encrypted.
        </p>
      </div>
    </form>
  );
}
