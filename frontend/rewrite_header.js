
const fs = require("fs");
const path = "src/components/admin/AdminHeader.tsx";

const content = `"use client";

import Link from "next/link";
import { LogOut, Menu, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { ProfileEditModal } from "./ProfileEditModal";

export function AdminHeader({ userEmail, userName, userRole, onMenuToggle, menuOpen }: { userEmail: string, userName?: string, userRole?: string, onMenuToggle?: () => void, menuOpen?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out securely");
      
      if (pathname.startsWith("/delivery")) {
        router.push("/delivery-login");
      } else {
        router.push("/admin-login");
      }
      router.refresh();
    } catch {
      toast.error("Failed to log out");
    }
  };

  const isAdmin = userRole === "admin";
  const isDelivery = pathname.startsWith("/delivery");

  return (
    <header className="admin-header sticky top-0 z-40 flex w-full items-center justify-between gap-3 px-4 sm:px-8">
      {/* Mobile Menu Toggle & Search Bar */}
      <div className="flex min-w-0 items-center gap-4 flex-1">
        {onMenuToggle && <Button variant="ghost" size="icon" className="lg:hidden text-slate-600" onClick={onMenuToggle} aria-expanded={menuOpen} aria-controls="admin-mobile-navigation">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>}
        <span className="sm:hidden text-sm font-semibold text-slate-700 truncate">{isDelivery ? "Delivery" : "JOJO Admin"}</span>
        
        <div className="hidden sm:flex relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input 
            type="search" 
            placeholder="Search..." aria-label="Search workspace"
            className="pl-10 h-10 w-full rounded-full border-0 bg-slate-100/80 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Side Links & Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        <nav className="hidden lg:flex items-center gap-6 mr-2 h-[60px]">
          {isAdmin && (
            <Link 
              href="/admin" 
              className={\`text-sm font-semibold h-full flex items-center transition-colors \${!isDelivery ? "text-blue-800 border-b-2 border-blue-700" : "text-slate-400 hover:text-slate-700"}\`}
            >
              Admin Dashboard
            </Link>
          )}
          <Link 
            href="/delivery" 
            className={\`text-sm font-semibold h-full flex items-center transition-colors \${isDelivery ? "text-blue-800 border-b-2 border-blue-700" : "text-slate-400 hover:text-slate-700"}\`}
          >
            Delivery System
          </Link>
        </nav>
        
        {/* Notifications */}
        <button aria-label="Notifications" className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100 hidden sm:block">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border border-white"></span>
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Open profile menu" className="flex items-center gap-3 outline-none rounded-full ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-700">
            <div className="h-10 w-10 rounded-full bg-[#e6eddc] text-[#315447] flex items-center justify-center text-sm font-semibold">
              {(userName || userEmail).slice(0, 2).toUpperCase()}
            </div>
            <span className="hidden xl:block text-left"><span className="block text-xs font-semibold text-slate-800">{userName || "My account"}</span><span className="block text-[10px] text-slate-500 mt-1">{isAdmin ? "Store administrator" : "Delivery partner"}</span></span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2">
            <DropdownMenuLabel className="flex flex-col space-y-2 p-2">
              <span className="text-sm font-semibold tracking-tight">{userName || "User Profile"}</span>
              <span className="text-xs text-muted-foreground">{userEmail}</span>
              <span className={\`text-[10px] font-bold uppercase tracking-wider w-fit px-2 py-0.5 rounded-full mt-1 \${isAdmin ? "text-destructive bg-destructive/10" : "text-blue-600 bg-blue-100"}\`}>
                {isAdmin ? "Administrator" : "Delivery Partner"}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-2 cursor-pointer font-medium mb-1" onClick={() => setShowProfileModal(true)}>
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            
            {isAdmin && (
              <DropdownMenuItem asChild className="sm:hidden p-2">
                <Link href="/admin" className="text-destructive font-medium">Admin Dashboard</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild className="sm:hidden p-2">
              <Link href="/delivery" className="text-blue-600 font-medium">Delivery System</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="sm:hidden" />
            
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer p-2 mt-1 rounded-md">
              <LogOut className="mr-2 h-4 w-4" />
              <span className="font-medium">Log out securely</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ProfileEditModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        currentName={userName || ""} 
        currentEmail={userEmail} 
      />
    </header>
  );
}
`;

fs.writeFileSync(path, content, "utf8");

