"use client";

import Link from "next/link";
import { LogOut, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ProfileEditModal } from "./ProfileEditModal";

export function AdminHeader({
  userEmail,
  userName,
  userRole,
  userImage,
  onMenuToggle,
  menuOpen,
}: {
  userEmail: string;
  userName?: string;
  userRole?: string;
  userImage?: string;
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}) {
  const pathname = usePathname();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Unable to log out");
      toast.success("Logged out securely");

      if (pathname.startsWith("/delivery")) {
        window.location.href = "/delivery-login";
      } else {
        window.location.href = "/admin-login";
      }
    } catch {
      toast.error("Failed to log out");
    }
  };

  const isAdmin = userRole === "admin";
  const isDelivery = pathname.startsWith("/delivery");
  const section = pathname.split("/")[2] || "dashboard";
  const title =
    (
      {
        dashboard: "Dashboard",
        products: "Products",
        categories: "Categories",
        inventory: "Inventory",
        orders: "Orders",
        shipments: "Shipping",
        customers: "Customers",
        analytics: "Analytics",
      } as Record<string, string>
    )[section] || "Workspace";

  return (
    <>
      <header className="admin-header sticky top-0 z-40 flex w-full items-center justify-between gap-3 px-4 sm:px-8">
        {/* Mobile Menu Toggle & Search Bar */}
        <div className="flex min-w-0 items-center gap-4 flex-1">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-600"
              onClick={onMenuToggle}
              aria-expanded={menuOpen}
              aria-controls="admin-mobile-navigation"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              aria-label="JOJO Store dashboard"
              className="admin-header-brand lg:hidden"
            >
              <img
                src="/jojo-store.svg"
                alt="JOJO Store"
                width={72}
                height={46}
              />
            </Link>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
              JOJO / WORKSPACE
            </p>
            <h2 className="mt-1 truncate text-base font-semibold text-[#2d383a]">
              {isDelivery ? "Delivery" : title}
            </h2>
          </div>
        </div>
        {/* Right Side Links & Profile */}
        <div className="flex items-center gap-3 sm:gap-5">
          {isAdmin && (
            <Link
              href="/admin/products/new"
              className="admin-primary-action hidden sm:inline-flex"
            >
              <Plus size={16} /> Add product
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Open profile menu"
              className="flex items-center gap-3 outline-none rounded-full ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#7965ed]"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#8b8cff] to-[#7548d2] text-white flex items-center justify-center text-sm font-semibold overflow-hidden">
                {userImage ? (
                  <img
                    src={userImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (userName || userEmail).slice(0, 2).toUpperCase()
                )}
              </div>
              <span className="hidden xl:block text-left">
                <span className="block text-xs font-semibold text-slate-800">
                  {userName || "My account"}
                </span>
                <span className="block text-[10px] text-slate-500 mt-1">
                  {isAdmin ? "Store administrator" : "Delivery partner"}
                </span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              <DropdownMenuLabel className="flex flex-col space-y-2 p-2">
                <span className="text-sm font-semibold tracking-tight">
                  {userName || "User Profile"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {userEmail}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider w-fit px-2 py-0.5 rounded-full mt-1 ${isAdmin ? "text-destructive bg-destructive/10" : "text-blue-600 bg-blue-100"}`}
                >
                  {isAdmin ? "Administrator" : "Delivery Partner"}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="p-2 cursor-pointer font-medium mb-1"
                onClick={() => setShowProfileModal(true)}
              >
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {isAdmin && (
                <DropdownMenuItem asChild className="sm:hidden p-2">
                  <Link href="/admin" className="text-destructive font-medium">
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild className="sm:hidden p-2">
                <Link
                  href={isAdmin ? "/admin/shipments" : "/delivery"}
                  className="text-blue-600 font-medium"
                >
                  {isAdmin ? "Shipping" : "Delivery System"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="sm:hidden" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer p-2 mt-1 rounded-md"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-medium">Log out securely</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentName={userName || ""}
        currentEmail={userEmail}
        currentImage={userImage || ""}
      />
    </>
  );
}
