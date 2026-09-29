"use client";

import React from "react";
import { Package, Truck, CheckCircle, MapPin, Map, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shipment, DeliveryAssignment } from "@/types";

export function DeliveryDashboardClient({ 
  assignments, 
  shipments 
}: { 
  assignments: DeliveryAssignment[], 
  shipments: Shipment[] 
}) {
  const pendingPickups = shipments.filter(s => s.status === "pickup_scheduled");
  const activeDeliveries = shipments.filter(s => s.status === "in_transit" || s.status === "out_for_delivery");
  const completedDeliveries = shipments.filter(s => s.status === "delivered");

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <h1 className="text-2xl font-bold tracking-tight relative z-10">Hello Partner,</h1>
        <p className="text-indigo-100 mt-1 relative z-10">You have {pendingPickups.length + activeDeliveries.length} active tasks today.</p>
        
        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
            <div className="text-3xl font-bold">{pendingPickups.length}</div>
            <div className="text-xs font-medium text-indigo-100 uppercase tracking-wider mt-1">Pickups</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
            <div className="text-3xl font-bold">{activeDeliveries.length}</div>
            <div className="text-xs font-medium text-indigo-100 uppercase tracking-wider mt-1">Deliveries</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 px-1">Your Assignments</h2>
        
        {assignments.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Map className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700">No active assignments</h3>
            <p className="text-sm text-slate-500 mt-1">Take a break! New assignments will appear here.</p>
          </div>
        ) : (
          shipments.map(shipment => (
            <Link key={shipment.id} href={`/delivery/assignments/${shipment.id}`}>
              <motion.div 
                whileHover={{ scale: 0.98 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4 relative overflow-hidden group"
              >
                <div className={`absolute top-0 left-0 w-1.5 h-full ${shipment.status === "pickup_scheduled" ? "bg-amber-400" : shipment.status === "delivered" ? "bg-blue-400" : "bg-blue-500"}`}></div>
                <div className="flex justify-between items-start pl-2">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SHP-{shipment.id.slice(0, 6)}</span>
                    <h3 className="font-semibold text-slate-800 mt-0.5 capitalize">{shipment.status.replace(/_/g, " ")}</h3>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
                
                <div className="flex items-start gap-3 pl-2">
                  <div className="mt-0.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="text-sm text-slate-600 line-clamp-2">
                    {shipment.deliveryAddressSnapshot?.addressLine1}, {shipment.deliveryAddressSnapshot?.city}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
