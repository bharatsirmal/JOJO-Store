"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import Link from "next/link";

export function CustomerActions({ userId, role }: { userId: string, role: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const approveDelivery = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/promote-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUid: userId }),
      });

      if (!res.ok) throw new Error("Failed to promote user");
      
      toast.success("Delivery partner approved successfully!");
      router.refresh();
    } catch (err) {
      toast.error("Error approving partner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {role === "delivery_pending" && (
        <Button size="sm" onClick={approveDelivery} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
          <Check className="w-4 h-4 mr-1" />
          Approve Delivery
        </Button>
      )}
      <Link href={`/admin/customers/${userId}`}>
        <Button variant="ghost" className="text-[#5c5cff] hover:text-[#4b4be5] hover:bg-indigo-50 font-medium">
          View Profile
        </Button>
      </Link>
    </div>
  );
}

