"use client";

import React, { useState } from "react";
import { Package, Truck, CheckCircle, AlertTriangle, Eye, ArrowRight, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { Shipment, Order } from "@/types";

export function ShipmentsClient({ 
  shipments, 
  eligibleOrders 
}: { 
  shipments: Shipment[], 
  eligibleOrders: Order[] 
}) {
  const [activeTab, setActiveTab] = useState<"queue" | "shipments">("queue");

  const handleCreateTask = async (orderId: string) => {
    try {
      const res = await fetch("/api/admin/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", orderId })
      });
      if (!res.ok) throw new Error("Failed to create task");
      toast.success("Shipment task created!");
      window.location.reload();
    } catch (e) {
      toast.error("Unable to create shipment.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-8 mt-6 pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Shipments</h1>
          <p className="text-slate-500">Manage fulfillment and track deliveries.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("queue")}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "queue" ? "text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          Fulfillment Queue
          {activeTab === "queue" && (
            <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("shipments")}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "shipments" ? "text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          Active Shipments
          {activeTab === "shipments" && (
            <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "queue" ? (
          <motion.div 
            key="queue"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-500" />
              Ready for Fulfillment
            </h2>
            <div className="space-y-4">
              {eligibleOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">No orders awaiting fulfillment.</div>
              ) : (
                eligibleOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">Order {order.id.slice(0, 8)}</span>
                      <span className="text-sm text-slate-500">{order.shippingAddress.fullName} • {order.items.length} items</span>
                    </div>
                    <button 
                      onClick={() => handleCreateTask(order.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Start Packing
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="shipments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search shipments..." 
                  className="w-full pl-9 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Filter className="h-4 w-4" /> Filter
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Shipment ID</th>
                    <th className="px-6 py-4 font-medium">Order</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Provider</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shipments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No shipments found.</td>
                    </tr>
                  ) : shipments.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-blue-600">SHP-{s.id.slice(0,6).toUpperCase()}</td>
                      <td className="px-6 py-4 text-slate-600">ORD-{s.orderId.slice(0,6).toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 capitalize">
                          {s.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 capitalize">{s.provider || "Unassigned"}</td>
                      <td className="px-6 py-4 text-slate-500">{s.createdAt ? format(new Date(s.createdAt), "MMM d, yyyy") : "N/A"}</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/shipments/${s.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                          View <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
