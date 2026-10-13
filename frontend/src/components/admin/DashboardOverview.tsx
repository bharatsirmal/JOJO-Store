import Link from "next/link";
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { DashboardTables } from "./DashboardClient";
import { AnalyticsCharts } from "./AnalyticsCharts";
import type { ComponentProps } from "react";
type Props = ComponentProps<typeof DashboardTables> & {
  totalRevenueFormatted: string;
  totalOrders: number;
  activeProductsCount: number;
  customersCount: number;
  salesData: { date: string; revenue: number; orders: number }[];
};
export function DashboardOverview(props: Props) {
  const stats = [
    {
      label: "Sales revenue",
      value: props.totalRevenueFormatted,
      icon: IndianRupee,
      note: "Paid and confirmed orders",
    },
    {
      label: "Total orders",
      value: props.totalOrders,
      icon: ShoppingCart,
      note: "All order statuses",
    },
    {
      label: "Active products",
      value: props.activeProductsCount,
      icon: Package,
      note: "Published in your storefront",
    },
    {
      label: "Customers",
      value: props.customersCount,
      icon: Users,
      note: "Registered customer accounts",
    },
  ];
  return (
    <div className="space-y-6">
      <div className="admin-welcome">
        <h1 className="text-3xl font-bold">Store overview</h1>
        <p>Manage your catalog, customers, and daily orders in one place.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, note }) => (
          <div className="admin-panel p-5" key={label}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              <span className="admin-icon">
                <Icon size={19} />
              </span>
            </div>
            <p className="mt-5 text-3xl font-semibold text-[#2d383a]">
              {value}
            </p>
            <p className="mt-2 text-xs text-slate-500">{note}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Manage orders",
            note: "Payments and fulfilment",
            href: "/admin/orders",
          },
          {
            label: "Check inventory",
            note: "Stock levels and reservations",
            href: "/admin/inventory",
          },
          {
            label: "Manage shipping",
            note: "Create and track deliveries",
            href: "/admin/shipments",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="admin-panel p-5 flex items-center justify-between gap-3"
          >
            <div>
              <h3 className="font-semibold">{item.label}</h3>
              <p className="text-xs text-slate-500 mt-2">{item.note}</p>
            </div>
            <ArrowUpRight className="text-purple-500" size={20} />
          </Link>
        ))}
      </div>
      <section className="admin-panel p-6">
        <div className="flex justify-between mb-5">
          <h2 className="font-semibold">Sales over time</h2>
          <Link className="admin-text-link text-sm" href="/admin/analytics">
            View analytics
          </Link>
        </div>
        {props.salesData.length ? (
          <AnalyticsCharts data={props.salesData} />
        ) : (
          <p className="py-16 text-center text-sm text-slate-500">
            Your sales chart will appear after your first confirmed order.
          </p>
        )}
      </section>
      <DashboardTables
        recentOrders={props.recentOrders}
        topProducts={props.topProducts}
      />
    </div>
  );
}
