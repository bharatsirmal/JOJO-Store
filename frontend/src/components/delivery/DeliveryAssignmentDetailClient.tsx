"use client";

import React from "react";
import { Package, Truck, CheckCircle, MapPin, User, Phone, ArrowLeft, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shipment } from "@/types";

export function DeliveryAssignmentDetailClient({ 
  shipment 
}: { 
  shipment: Shipment 
}) {
  const router = useRouter();

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/delivery/shipments/${shipment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Status updated!");
      router.refresh();
    } catch (e) {
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24 pt-2">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/delivery" className="p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <h1 className="font-bold text-slate-800 text-lg">Task Details</h1>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 ${shipment.status === "pickup_scheduled" ? "bg-amber-400" : shipment.status === "delivered" ? "bg-blue-400" : "bg-blue-500"}`}></div>
        <div className="mt-2 flex justify-between items-start mb-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reference</span>
            <h2 className="font-bold text-xl text-slate-800">SHP-{shipment.id.slice(0, 6)}</h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold capitalize bg-slate-100 text-slate-600">
            {shipment.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Customer Details</span>
            </div>
            <div className="pl-6 text-sm text-slate-600">
              <p className="font-medium text-slate-800">{shipment.deliveryAddressSnapshot?.fullName}</p>
              <p className="flex items-center gap-1 mt-1 text-blue-600">
                <Phone className="h-3 w-3" /> {shipment.deliveryAddressSnapshot?.phone}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Delivery Address</span>
            </div>
            <div className="pl-6 text-sm text-slate-600">
              <p>{shipment.deliveryAddressSnapshot?.addressLine1}</p>
              {shipment.deliveryAddressSnapshot?.addressLine2 && <p>{shipment.deliveryAddressSnapshot?.addressLine2}</p>}
              <p>{shipment.deliveryAddressSnapshot?.city}, {shipment.deliveryAddressSnapshot?.postalCode}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 pb-safe z-50">
        <div className="max-w-md mx-auto">
          {shipment.status === "pickup_scheduled" && (
            <button 
              onClick={() => handleUpdateStatus("picked_up")}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              Confirm Pickup from Store
            </button>
          )}
          
          {shipment.status === "picked_up" && (
            <button 
              onClick={() => handleUpdateStatus("out_for_delivery")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
            >
              Start Delivery Route
            </button>
          )}

          {shipment.status === "out_for_delivery" && (
            <div className="flex gap-3">
              <button 
                onClick={() => handleUpdateStatus("delivery_failed")}
                className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-4 rounded-2xl active:scale-95 transition-all border border-rose-200"
              >
                Failed
              </button>
              <button 
                onClick={() => handleUpdateStatus("delivered")}
                className="flex-[2] bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                Mark Delivered
              </button>
            </div>
          )}

          {shipment.status === "delivered" && (
            <div className="w-full bg-slate-50 text-slate-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-slate-200">
              <CheckCircle className="h-5 w-5" /> Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
