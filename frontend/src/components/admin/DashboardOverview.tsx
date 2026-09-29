import { DollarSign, ShoppingCart, Package, Users, Calendar } from "lucide-react";
import { DashboardCharts, DashboardTables } from "./DashboardClient";
import type { ComponentProps } from "react";

type DashboardOverviewProps = ComponentProps<typeof DashboardTables> & {
  totalRevenueFormatted: string;
  totalOrders: number;
  activeProductsCount: number;
  customersCount: number;
};

export function DashboardOverview({ totalRevenueFormatted, totalOrders, activeProductsCount, customersCount, recentOrders, topProducts }: DashboardOverviewProps) {
  return (
    <div className="space-y-6 pb-8 px-4 sm:px-8 mt-6">
      {/* Header Area */}
      <div className="admin-welcome flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            Dashboard
          </h1><p>A little clarity for your every day. Here is your store at a glance.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm text-sm text-slate-600 font-medium cursor-pointer hover:bg-slate-50 transition-colors">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>Real-time Data</span>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Revenue */}
        <div className="metric-card bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between group">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-slate-500">Total Revenue</div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-800">{totalRevenueFormatted}</div>
            </div>
          </div>
          <div className="h-16 w-24 bg-gradient-to-t from-blue-50 to-transparent relative rounded-b-lg mt-auto opacity-75 group-hover:opacity-100 transition-opacity">
            <svg className="absolute bottom-0 w-full h-full text-blue-400" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0 40 L 20 30 L 40 35 L 60 15 L 80 20 L 100 5 L 100 40 Z" fill="currentColor" fillOpacity="0.2"/>
              <path d="M0 40 L 20 30 L 40 35 L 60 15 L 80 20 L 100 5" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        {/* Sales */}
        <div className="metric-card bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between group">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 transition-transform group-hover:scale-110">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-slate-500">Total Orders</div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-800">{totalOrders}</div>
            </div>
          </div>
          <div className="h-16 w-24 bg-gradient-to-t from-orange-50 to-transparent relative rounded-b-lg mt-auto opacity-75 group-hover:opacity-100 transition-opacity">
            <svg className="absolute bottom-0 w-full h-full text-orange-400" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0 40 L 20 35 L 40 25 L 60 30 L 80 15 L 100 10 L 100 40 Z" fill="currentColor" fillOpacity="0.2"/>
              <path d="M0 40 L 20 35 L 40 25 L 60 30 L 80 15 L 100 10" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        {/* Products */}
        <div className="metric-card bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between group">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 transition-transform group-hover:scale-110">
                <Package className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-slate-500">Products</div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-800">{activeProductsCount}</div>
            </div>
          </div>
          <div className="h-16 w-24 bg-gradient-to-t from-blue-50 to-transparent relative rounded-b-lg mt-auto opacity-75 group-hover:opacity-100 transition-opacity">
            <svg className="absolute bottom-0 w-full h-full text-blue-400" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0 40 L 20 20 L 40 25 L 60 10 L 80 15 L 100 5 L 100 40 Z" fill="currentColor" fillOpacity="0.2"/>
              <path d="M0 40 L 20 20 L 40 25 L 60 10 L 80 15 L 100 5" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        {/* Users */}
        <div className="metric-card bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between group">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 transition-transform group-hover:scale-110">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium text-slate-500">Customers</div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-800">{customersCount}</div>
            </div>
          </div>
          <div className="h-16 w-24 bg-gradient-to-t from-purple-50 to-transparent relative rounded-b-lg mt-auto opacity-75 group-hover:opacity-100 transition-opacity">
            <svg className="absolute bottom-0 w-full h-full text-purple-400" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0 40 L 20 30 L 40 20 L 60 35 L 80 10 L 100 15 L 100 40 Z" fill="currentColor" fillOpacity="0.2"/>
              <path d="M0 40 L 20 30 L 40 20 L 60 35 L 80 10 L 100 15" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>

      <DashboardCharts />
      
      <DashboardTables recentOrders={recentOrders} topProducts={topProducts} />
    </div>
  );
}

