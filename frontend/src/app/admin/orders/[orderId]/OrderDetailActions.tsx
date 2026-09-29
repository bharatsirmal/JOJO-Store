"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OrderStatus } from "@/types";
import { Check, X, Package } from "lucide-react";

export default function OrderDetailActions({ orderId, currentStatus }: { orderId: string, currentStatus: OrderStatus }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (newStatus: OrderStatus) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(`Order marked as ${newStatus}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  
  const createShipment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", orderId }),
      });

      if (!res.ok) throw new Error("Failed to create shipment");
      
      const data = await res.json();
      toast.success("Shipment created successfully!");
      router.push(`/admin/shipments/${data.shipment.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create shipment");
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStatus === "pending_payment") {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => updateStatus("cancelled")}
          disabled={isLoading}
        >
          <X className="w-4 h-4 mr-1" />
          Cancel Order
        </Button>
        <Button 
          size="sm" 
          onClick={() => updateStatus("payment_processing")}
          disabled={isLoading}
        >
          <Check className="w-4 h-4 mr-1" />
          Mark as Paid
        </Button>
      </div>
    );
  }
  
  if (currentStatus === "payment_processing") {
    return (
      <Button 
        size="sm" 
        onClick={() => updateStatus("confirmed")}
        disabled={isLoading}
      >
        <Check className="w-4 h-4 mr-1" />
        Confirm Order
      </Button>
    );
  }

  
  if (currentStatus === "confirmed") {
    return (
      <Button 
        size="sm" 
        onClick={createShipment}
        disabled={isLoading}
      >
        <Package className="w-4 h-4 mr-1" />
        Create Shipment
      </Button>
    );
  }

  return null;

}

