"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Layers, Box, ShoppingCart, CreditCard, Undo2, Users, BarChart3, Tags, Truck, Settings, ArrowUpRight } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Layers },
  { name: "Inventory", href: "/admin/inventory", icon: Box },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Refunds", href: "/admin/refunds", icon: Undo2 },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Promotions", href: "/admin/promotions", icon: Tags },
  { name: "Shipping", href: "/admin/shipments", icon: Truck },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand"><Link href="/admin" onClick={onNavigate}><img src="/jojo-store.svg" alt="JOJO Store Admin" /></Link></div>
      <p className="admin-sidebar-caption">STORE WORKSPACE</p>
      <nav aria-label="Admin sections">
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
          return <Link key={item.href} href={item.href} onClick={onNavigate} className="admin-nav-link" aria-current={active ? "page" : undefined}>
            <item.icon size={17} strokeWidth={1.7} aria-hidden="true" /><span>{item.name}</span>
          </Link>;
        })}
      </nav>
      <div className="admin-sidebar-footer"><span>YOUR STORE, AT A GLANCE.</span><Link href="/" onClick={onNavigate}>View storefront <ArrowUpRight size={16} /></Link></div>
    </aside>
  );
}
