"use client";

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

export function AdminHeader({ userEmail, userName, userRole }: { userEmail: string, userName?: string, userRole?: string }) {
  const router = useRouter();
  const pathname = usePathname();

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
    <header className="sticky top-0 z-40 flex h-[60px] w-full items-center justify-between border-b border-slate-200 bg-white px-6 sm:px-8">
      {/* Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="md:hidden text-slate-500">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        
        <div className="hidden sm:flex relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input 
            type="search" 
            placeholder="Search..." 
            className="pl-10 h-10 w-full rounded-full border-0 bg-slate-100/80 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Side Links & Profile */}
      <div className="flex items-center gap-6">
        <nav className="hidden lg:flex items-center gap-6 mr-2 h-[60px]">
          {isAdmin && (
            <Link 
              href="/admin" 
              className={`text-sm font-semibold h-full flex items-center transition-colors ${!isDelivery ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-700"}`}
            >
              Admin Dashboard
            </Link>
          )}
          <Link 
            href="/delivery" 
            className={`text-sm font-semibold h-full flex items-center transition-colors ${isDelivery ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-700"}`}
          >
            Delivery System
          </Link>
        </nav>
        
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100 hidden sm:block">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border border-white"></span>
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none rounded-full ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-500">
            <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200">
              <img 
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0" 
                alt="Profile Avatar" 
                className="h-full w-full object-cover"
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2">
            <DropdownMenuLabel className="flex flex-col space-y-2 p-2">
              <span className="text-sm font-semibold tracking-tight">{userName || "User Profile"}</span>
              <span className="text-xs text-muted-foreground">{userEmail}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider w-fit px-2 py-0.5 rounded-full mt-1 ${isAdmin ? 'text-destructive bg-destructive/10' : 'text-blue-600 bg-blue-100'}`}>
                {isAdmin ? 'Administrator' : 'Delivery Partner'}
              </span>
            </DropdownMenuLabel>
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
    </header>
  );
}
