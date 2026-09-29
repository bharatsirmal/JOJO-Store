import { PaymentStatusClient } from "./PaymentStatusClient";
import { Suspense } from "react";

export const metadata = {
  title: "Payment Status | JOJO Store",
};

export default function PaymentStatusPage() {
  return (
    <div className="bg-muted/30 min-h-[100dvh] py-20 flex items-center justify-center">
      <Suspense fallback={<div className="animate-pulse">Loading status...</div>}>
        <PaymentStatusClient />
      </Suspense>
    </div>
  );
}
