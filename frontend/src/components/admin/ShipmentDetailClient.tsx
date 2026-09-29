"use client";

import React, { useState } from "react";
import { Package, CheckCircle, Truck, Info, CheckSquare, Square, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { Shipment, Order } from "@/types";
import { useRouter } from "next/navigation";

export function ShipmentDetailClient({ 
  shipment, 
  order,
  deliveryPartners = []
}: { 
  shipment: Shipment, 
  order: Order,
  deliveryPartners?: any[]
}) {
  const router = useRouter();
  
  // State for the packing checklist
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const allItemsChecked = order.items.length > 0 && order.items.every(item => checkedItems[item.productId + item.variantId]);

  const toggleCheck = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMarkPacked = async () => {
    if (!allItemsChecked) {
      toast.error("Please pack all items before confirming.");
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/shipments/${shipment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_ready" })
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Shipment is ready for pickup!");
      router.refresh();
    } catch (e) {
      toast.error("Unable to update shipment.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-6 mt-6 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/shipments" className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Shipment #{shipment.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-slate-500 capitalize">Status: {shipment.status.replace(/_/g, " ")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Packing Checklist */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" /> Packing Checklist
            </h2>
            
            <div className="space-y-4">
              {order.items.map((item) => {
                const key = item.productId + item.variantId;
                const isChecked = checkedItems[key] || false;
                
                return (
                  <div 
                    key={key} 
                    className={`flex items-start gap-4 p-4 border rounded-xl transition-colors cursor-pointer ${isChecked ? "bg-blue-50/50 border-blue-200" : "bg-white border-slate-200 hover:border-blue-300"}`}
                    onClick={() => toggleCheck(key)}
                  >
                    <div className="mt-1">
                      {isChecked ? <CheckSquare className="h-5 w-5 text-blue-600" /> : <Square className="h-5 w-5 text-slate-400" />}
                    </div>
                    {item.imagePath && (
                      <img src={item.imagePath} alt={item.productName || "Product"} className="h-16 w-16 object-cover rounded-lg bg-slate-100" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{item.productName}</p>
                      <p className="text-sm text-slate-500">Size: {item.size} • Color: {item.color}</p>
                      <p className="text-sm font-medium text-slate-700 mt-1">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {shipment.status === "fulfillment_pending" || shipment.status === "packing" ? (
              <button
                disabled={!allItemsChecked}
                onClick={handleMarkPacked}
                className={`w-full mt-6 py-3 rounded-xl font-medium transition-colors ${allItemsChecked ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
              >
                Mark as Ready for Shipping
              </button>
            ) : (
              <div className="w-full mt-6 py-3 rounded-xl font-medium bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5" /> Packing Completed
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Assignment UI */}
          {(shipment.status === "ready_for_shipping" || shipment.status === "pickup_scheduled") && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-indigo-600" /> Delivery Assignment
              </h3>
              
              {shipment.status === "ready_for_shipping" ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500">Assign a delivery partner to handle this shipment.</p>
                  <select 
                    id="partner-select"
                    className="w-full border-slate-200 rounded-lg text-sm p-2 focus:ring-blue-500"
                    onChange={async (e) => {
                      if (!e.target.value) return;
                      try {
                        const res = await fetch(`/api/admin/shipments/${shipment.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "assign", partnerId: e.target.value })
                        });
                        if (!res.ok) throw new Error("Assign failed");
                        toast.success("Delivery partner assigned successfully!");
                        router.refresh();
                      } catch (err) {
                        toast.error("Failed to assign partner.");
                      }
                    }}
                  >
                    <option value="">Select a partner...</option>
                    {deliveryPartners.map(p => (
                      <option key={p.id} value={p.id}>{p.email}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-sm font-medium text-blue-700 bg-blue-50 p-3 rounded-xl flex items-center gap-2 border border-blue-200">
                  <CheckCircle className="h-4 w-4" /> Partner Assigned
                </div>
              )}
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-slate-500" /> Delivery Address
            </h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p className="font-medium text-slate-800">{shipment.deliveryAddressSnapshot?.fullName}</p>
              <p>{shipment.deliveryAddressSnapshot?.addressLine1}</p>
              {shipment.deliveryAddressSnapshot?.addressLine2 && <p>{shipment.deliveryAddressSnapshot?.addressLine2}</p>}
              <p>{shipment.deliveryAddressSnapshot?.city}, {shipment.deliveryAddressSnapshot?.stateOrProvince} {shipment.deliveryAddressSnapshot?.postalCode}</p>
              <p className="mt-2 font-medium">{shipment.deliveryAddressSnapshot?.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
