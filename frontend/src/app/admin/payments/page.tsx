import { requireAdmin } from "@/lib/auth/server";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminPaymentsPage() {
  await requireAdmin();
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Payments</h1>
          <p className="text-[15px] text-slate-500 mt-1">View transaction history and manage payment gateways.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <div className="bg-indigo-50 p-4 rounded-full text-indigo-500 mb-4">
          <CreditCard className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Payment Processing</h2>
        <p className="text-slate-500 max-w-md mb-6">
          Payment processing integration (Stripe/PayPal) and transaction management are currently in development and will be released in an upcoming phase.
        </p>
        <Button variant="outline" className="text-[#5c5cff] border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50">
          Learn More
        </Button>
      </div>
    </div>
  );
}
