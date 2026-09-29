"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Box,
  ShoppingCart,
  CreditCard,
  Undo2,
  Users,
  BarChart3,
  Tags,
  Truck,
  Settings,
  ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Layers },
  { name: "Inventory", href: "/admin/inventory", icon: Box },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart, notify: true },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Refunds", href: "/admin/refunds", icon: Undo2 },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Promotions", href: "/admin/promotions", icon: Tags },
  { name: "Shipping", href: "/admin/shipments", icon: Truck },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white text-slate-600 hidden md:flex flex-col h-full border-r border-slate-200">
      {/* Logo Area */}
      <div className="h-[60px] flex items-center px-6 border-b border-slate-200">
          <Link href="/admin" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src="/jojo-store.svg" alt="JOJO Store Admin" className="h-7 w-auto" />
          </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href}>
              <span
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md relative transition-all duration-200",
                  isActive
                    ? "text-[#5c5cff] bg-[#f0f0ff]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-4 w-4 transition-colors",
                    isActive ? "text-[#5c5cff]" : "text-slate-500 group-hover:text-slate-700"
                  )}
                  aria-hidden="true"
                />
                <span className="relative z-10 flex-1">{item.name}</span>
                
                {item.notify && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
