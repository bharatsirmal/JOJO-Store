"use client";
import React from "react";

import { FileText, MoreHorizontal, AlertCircle, Package } from "lucide-react";

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      
      {/* Area & Bar Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">Revenue Overview</h3>
          </div>
          <div className="flex gap-2">
            <select aria-label="Revenue period" className="text-xs bg-slate-50 border-0 rounded-lg px-2 py-1 text-slate-500 font-medium outline-none">
              <option>This Year</option>
            </select>
          </div>
        </div>
        <div className="h-72 w-full flex flex-col gap-4 items-center justify-center bg-[#f4f7f1] rounded-xl border border-dashed border-[#d7e0ce] text-center p-6">
          <div className="rounded-2xl bg-white p-4 text-[#728a65] shadow-sm"><BarChartIcon className="h-8 w-8" /></div>
          <div><p className="text-sm text-slate-600 font-medium">Not enough data to display charts</p><p className="text-xs text-slate-500 mt-2">Revenue insights will appear here when available.</p></div>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800">Traffic Sources</h3>
          </div>
          <MoreHorizontal className="h-5 w-5 text-slate-400" />
        </div>
        <div className="flex-1 w-full flex flex-col gap-4 items-center justify-center bg-[#f7f6f1] rounded-xl border border-dashed border-[#e2dece] p-6 min-h-[200px] text-center">
          <div className="rounded-full bg-white p-4 text-[#a08a54] shadow-sm"><PieChartIcon className="h-8 w-8" /></div>
          <div className="text-sm text-slate-600 font-medium">No traffic data recorded</div>
        </div>
      </div>
    </div>
  );
}

export function DashboardTables({ recentOrders = [], topProducts = [] }: { recentOrders?: any[], topProducts?: any[] }) {
  const formatPrice = (minor: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(minor / 100);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-1">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">Recent Orders</h3>
          </div>
          <MoreHorizontal className="h-5 w-5 text-slate-400" />
        </div>
        <div className="space-y-4">
          {recentOrders.length === 0 ? (
             <div className="text-sm text-slate-500 py-4 text-center">No recent orders found.</div>
          ) : recentOrders.map((order, i) => (
            <div key={order.id || i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {order.customerName ? order.customerName.charAt(0).toUpperCase() : "#"}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-800 line-clamp-1">{order.customerName || "Guest"}</div>
                  <div className="text-xs text-slate-500 capitalize">{order.status || "Pending"}</div>
                </div>
              </div>
              <div className="text-sm font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md">
                {formatPrice(order.totalMinor || 0)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-1">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800">New Products</h3>
          </div>
          <MoreHorizontal className="h-5 w-5 text-slate-400" />
        </div>
        <div className="space-y-4">
          {topProducts.length === 0 ? (
             <div className="text-sm text-slate-500 py-4 text-center">No products found.</div>
          ) : topProducts.map((product, i) => (
            <div key={product.id || i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                {product.images && product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-indigo-50 flex items-center justify-center text-indigo-300">
                    <Package className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">{product.name}</div>
                <div className="text-xs text-slate-500">{formatPrice(product.priceMinor || 0)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-1">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-slate-800">System Alerts</h3>
          </div>
          <MoreHorizontal className="h-5 w-5 text-slate-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800">Low Stock Warning</div>
              <div className="text-xs text-slate-500">2 products are running low</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800">Database Backup</div>
              <div className="text-xs text-slate-500">Completed successfully at 3:00 AM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>
    </svg>
  )
}

function PieChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  )
}
