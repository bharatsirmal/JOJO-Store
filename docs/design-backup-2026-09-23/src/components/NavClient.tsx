"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";

interface NavClientProps {
  user: { displayName: string; role: string } | null;
}

export function NavClient({ user }: NavClientProps) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { items, setDrawerOpen } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setIsMobileOpen(false);
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        {user?.role !== "admin" && (
          <>
            <Link href="/products" className="text-sm font-medium hover:text-primary/70 transition-colors">Shop</Link>
            <Link href="/products?category=women" className="text-sm font-medium hover:text-primary/70 transition-colors">Women</Link>
            <Link href="/products?category=men" className="text-sm font-medium hover:text-primary/70 transition-colors">Men</Link>
          </>
        )}
        
        {user?.role === "admin" && (
          <Link href="/admin" className="text-sm font-medium text-destructive hover:underline">Admin Dashboard</Link>
        )}
        {(user?.role === "admin" || user?.role === "delivery_partner") && (
          <Link href="/delivery" className="text-sm font-medium text-orange-600 hover:underline">Delivery System</Link>
        )}

        <div className="ml-4 flex items-center gap-4 border-l pl-4">
          {user?.role !== "admin" && (
            <>
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="w-5 h-5" />
                <span className="sr-only">Search</span>
              </button>
              
              <button onClick={() => setDrawerOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="sr-only">Cart</span>
                {mounted && items.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/account" className="text-muted-foreground hover:text-foreground transition-colors">
                <User className="w-5 h-5" />
                <span className="sr-only">Account</span>
              </Link>
              <button onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              }} className="text-muted-foreground hover:text-foreground transition-colors">
                <LogOut className="w-5 h-5" />
                <span className="sr-only">Logout</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium hover:underline">Login</Link>
          )}
        </div>
      </nav>

      {/* Mobile Toggle */}
      <div className="flex md:hidden items-center gap-4 z-10">
        {user?.role !== "admin" && (
          <>
            <button onClick={() => setIsSearchOpen(true)} className="text-foreground">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setDrawerOpen(true)} className="text-foreground relative">
              <ShoppingBag className="w-5 h-5" />
              {mounted && items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </>
        )}
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-foreground">
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && user?.role !== "admin" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 w-full h-24 bg-background border-b z-50 flex items-center justify-center px-4 shadow-sm"
          >
            <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search for products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-12 rounded-full border bg-muted focus:bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
              />
              <button 
                type="button" 
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 w-full bg-background border-b shadow-lg p-4 flex flex-col gap-4 md:hidden"
          >
            {user?.role !== "admin" && (
              <>
                <Link href="/products" onClick={() => setIsMobileOpen(false)} className="text-lg font-medium p-2 border-b">Shop All</Link>
                <Link href="/products?category=women" onClick={() => setIsMobileOpen(false)} className="text-lg font-medium p-2 border-b">Women</Link>
                <Link href="/products?category=men" onClick={() => setIsMobileOpen(false)} className="text-lg font-medium p-2 border-b">Men</Link>
              </>
            )}
            
            {user?.role === "admin" && (
              <Link href="/admin" onClick={() => setIsMobileOpen(false)} className="text-lg font-medium text-destructive p-2 border-b">Admin Dashboard</Link>
            )}
            {(user?.role === "admin" || user?.role === "delivery_partner") && (
              <Link href="/delivery" onClick={() => setIsMobileOpen(false)} className="text-lg font-medium text-orange-600 p-2 border-b">Delivery System</Link>
            )}
            
            {user ? (
              <>
                <Link href="/account" onClick={() => setIsMobileOpen(false)} className="text-lg font-medium p-2 border-b">My Account</Link>
                {user.role !== "admin" && (
                  <Link href="/wishlist" onClick={() => setIsMobileOpen(false)} className="text-lg font-medium p-2 border-b">Wishlist</Link>
                )}
                <div className="p-2">
                  <Button onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/login';
                  }} variant="outline" className="w-full">Logout</Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 p-2 mt-2">
                <Link href="/login" onClick={() => setIsMobileOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileOpen(false)} className="w-full">
                  <Button className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

