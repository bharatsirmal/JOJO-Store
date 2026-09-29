"use client";

import React from "react";
import { Package, Truck, CheckCircle, MapPin, Check, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Shipment, ShipmentStatus } from "@/types";

const milestones: { status: ShipmentStatus; label: string; icon: any }[] = [
  { status: "fulfillment_pending", label: "Order Confirmed", icon: Check },
  { status: "packing", label: "Packing", icon: Package },
  { status: "ready_for_shipping", label: "Ready to Ship", icon: Package },
  { status: "pickup_scheduled", label: "Pickup Scheduled", icon: Truck },
  { status: "picked_up", label: "Picked Up", icon: Truck },
  { status: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
  { status: "delivered", label: "Delivered", icon: CheckCircle }
];

export function TrackingClient({ shipment }: { shipment: Shipment | null }) {
  if (!shipment) {
    return (
      <div className="max-w-2xl mx-auto p-8 mt-12 bg-white rounded-3xl shadow-sm border border-slate-100 text-center">
        <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Your order is being processed</h2>
        <p className="text-slate-500 mt-2">Tracking details will appear here once your order is packed and ready for shipping.</p>
      </div>
    );
  }

  // Find the index of the current status
  const currentIndex = milestones.findIndex(m => m.status === shipment.status);
  // If not found, it might be an exception or failure, handle gracefully
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 mt-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Track Shipment</h1>
            <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider font-semibold">SHP-{shipment.id.slice(0, 8)}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold capitalize bg-blue-100 text-blue-700">
            {shipment.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="p-8 relative">
          {/* Vertical Timeline */}
          <div className="absolute left-[2.25rem] top-8 bottom-8 w-0.5 bg-slate-100 rounded-full">
            <motion.div 
              className="w-full bg-blue-500 rounded-full origin-top"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: activeIndex / (milestones.length - 1) }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ height: "100%" }}
            />
          </div>

          <div className="space-y-8 relative z-10">
            {milestones.map((milestone, index) => {
              const isCompleted = index <= activeIndex;
              const isActive = index === activeIndex;
              const Icon = milestone.icon;

              return (
                <div key={milestone.status} className="flex items-start gap-6">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-500 ${isCompleted ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-white border-slate-200 text-slate-300"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="pt-2">
                    <h3 className={`font-semibold ${isCompleted ? "text-slate-800" : "text-slate-400"}`}>
                      {milestone.label}
                    </h3>
                    {isActive && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-blue-600 font-medium mt-1"
                      >
                        Currently at this stage
                      </motion.p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
