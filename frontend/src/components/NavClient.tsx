"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Menu, X, User, LogOut, Heart } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";
import { useDialogFocus } from "@/lib/useDialogFocus";

interface NavClientProps {
  user: {
    displayName: string | null;
    role: string | null;
  } | null;
}

export function NavClient({ user }: NavClientProps) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { items, setDrawerOpen } = useCartStore();

  // Avoid hydration mismatch by waiting for mount to render portals/cart badge
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const searchRef = useDialogFocus(isSearchOpen, () => setIsSearchOpen(false));

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setIsMobileOpen(false);
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex items-center justify-between flex-1">
      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-6">
        {user?.role !== "admin" && (
          <>
            <Link href="/products" className="text-[15px] font-semibold text-white hover:text-gray-300 transition-colors">Shop</Link>
            <Link href="/products?category=women" className="text-[15px] font-semibold text-white hover:text-gray-300 transition-colors">Women</Link>
            <Link href="/products?category=men" className="text-[15px] font-semibold text-white hover:text-gray-300 transition-colors">Men</Link>
          </>
        )}
        
        {user?.role === "admin" && (
          <Link href="/admin" className="text-[15px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">Admin Dashboard</Link>
        )}
        {(user?.role === "admin" || user?.role === "delivery_partner") && (
          <Link href="/delivery" className="text-[15px] font-semibold text-orange-400 hover:text-orange-300 transition-colors">Delivery System</Link>
        )}
      </nav>

      {/* Desktop Right Side Icons */}
      <div className="hidden md:flex items-center gap-5 ml-auto">
        {user?.role !== "admin" && (
          <>
            <form onSubmit={handleSearch} className="relative group mr-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400 group-focus-within:text-white transition-colors" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search for items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[36px] w-[240px] rounded-full bg-[#1c1c1c] border border-transparent pl-[38px] pr-4 text-[14px] text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-all"
              />
            </form>
            
            <Link href="/wishlist" className="text-gray-300 hover:text-white transition-colors">
              <Heart className="w-5 h-5" strokeWidth={1.5} />
              <span className="sr-only">Wishlist</span>
            </Link>

            {user ? (
              <Link href="/account" className="text-gray-300 hover:text-white transition-colors">
                <User className="w-5 h-5" strokeWidth={1.5} />
                <span className="sr-only">Account</span>
              </Link>
            ) : (
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                <User className="w-5 h-5" strokeWidth={1.5} />
                <span className="sr-only">Login</span>
              </Link>
            )}

            <button onClick={() => setDrawerOpen(true)} className="text-gray-300 hover:text-white transition-colors relative">
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              <span className="sr-only">Cart</span>
              {mounted && items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </>
        )}

        {user?.role === "admin" && (
          <div className="flex items-center gap-4">
            <Link href="/account" className="text-gray-300 hover:text-white transition-colors">
              <User className="w-5 h-5" strokeWidth={1.5} />
              <span className="sr-only">Account</span>
            </Link>
            <button onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
            }} className="text-gray-300 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" strokeWidth={1.5} />
              <span className="sr-only">Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Toggle & Icons */}
      <div className="flex md:hidden items-center gap-4 z-10 ml-auto">
        {user?.role !== "admin" && (
          <>
            <button onClick={() => { setIsMobileOpen(false); setIsSearchOpen(true); }} className="text-white" aria-label="Search">
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button onClick={() => { setIsMobileOpen(false); setDrawerOpen(true); }} className="text-white relative" aria-label="Cart">
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              {mounted && items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </>
        )}
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-white" aria-label={isMobileOpen ? "Close menu" : "Open menu"} aria-expanded={isMobileOpen} aria-controls="store-mobile-menu">
          {isMobileOpen ? <X className="w-6 h-6" strokeWidth={1.5} /> : <Menu className="w-6 h-6" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Portal keeps the overlay outside the sticky header's stacking context. */}
      {mounted && createPortal(<AnimatePresence>
        {isSearchOpen && user?.role !== "admin" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            ref={searchRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            tabIndex={-1}
            onClick={(event) => { if (event.target === event.currentTarget) setIsSearchOpen(false); }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm px-5 pt-8 sm:pt-24"
          >
            <form onSubmit={handleSearch} className="w-full max-w-2xl relative rounded-full bg-[#111] border border-[#333] p-1 shadow-2xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                aria-label="Search for products"
                placeholder="Search for products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-12 rounded-full bg-transparent text-white focus:outline-none"
              />
              <button 
                type="button" 
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            id="store-mobile-menu"
            role="navigation"
            aria-label="Mobile navigation"
            className="absolute top-16 left-0 w-full max-h-[calc(100dvh-4rem)] overflow-y-auto bg-[#0a0a0a] border-b border-[#222] shadow-lg p-5 flex flex-col gap-3 md:hidden"
          >
            {user?.role !== "admin" && (
              <>
                <Link href="/products" onClick={() => setIsMobileOpen(false)} className="text-[15px] font-semibold text-white p-3 border-b border-[#222] hover:text-gray-300">Shop All</Link>
                <Link href="/products?category=women" onClick={() => setIsMobileOpen(false)} className="text-[15px] font-semibold text-white p-3 border-b border-[#222] hover:text-gray-300">Women</Link>
                <Link href="/products?category=men" onClick={() => setIsMobileOpen(false)} className="text-[15px] font-semibold text-white p-3 border-b border-[#222] hover:text-gray-300">Men</Link>
              </>
            )}
            
            {user?.role === "admin" && (
              <Link href="/admin" onClick={() => setIsMobileOpen(false)} className="text-[15px] font-semibold text-blue-400 p-3 border-b border-[#222]">Admin Dashboard</Link>
            )}
            {(user?.role === "admin" || user?.role === "delivery_partner") && (
              <Link href="/delivery" onClick={() => setIsMobileOpen(false)} className="text-[15px] font-semibold text-orange-400 p-3 border-b border-[#222]">Delivery System</Link>
            )}
            
            {user ? (
              <>
                <Link href="/account" onClick={() => setIsMobileOpen(false)} className="text-[15px] font-semibold text-gray-300 p-3 border-b border-[#222]">My Account</Link>
                {user.role !== "admin" && (
                  <Link href="/wishlist" onClick={() => setIsMobileOpen(false)} className="text-[15px] font-semibold text-gray-300 p-3 border-b border-[#222]">Wishlist</Link>
                )}
                <div className="p-3">
                  <Button onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/login';
                  }} variant="outline" className="w-full bg-transparent text-white border-[#333] hover:bg-[#222] hover:text-white">Logout</Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 p-3 mt-2">
                <Link href="/login" onClick={() => setIsMobileOpen(false)} className={buttonVariants({ variant: "outline", className: "w-full bg-transparent text-white border-[#333] hover:bg-[#222] hover:text-white" })}>Login</Link>
                <Link href="/register" onClick={() => setIsMobileOpen(false)} className={buttonVariants({ className: "w-full bg-white text-black hover:bg-gray-200" })}>Register</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
