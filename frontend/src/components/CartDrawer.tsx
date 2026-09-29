"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";
import { toast } from "sonner";
import { useDialogFocus } from "@/lib/useDialogFocus";

export function CartDrawer() {
  const { isDrawerOpen, setDrawerOpen, items, updateQuantity, removeItem } = useCartStore();
  
  // Prevent hydration mismatch for persisted store
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const drawerRef = useDialogFocus(mounted && isDrawerOpen, () => setDrawerOpen(false));
  
  if (!mounted) return null;
  
  const subtotal = items.reduce((sum, item) => sum + (item.priceMinor || 0) * item.quantity, 0);

  const handleDecrease = (productId: string, variantId: string, quantity: number) => {
    if (quantity <= 1) {
      removeItem(productId, variantId);
      toast.info("Item removed from your bag.");
    } else {
      updateQuantity(productId, variantId, quantity - 1);
    }
  };

  const handleIncrease = (productId: string, variantId: string, quantity: number) => {
    updateQuantity(productId, variantId, quantity + 1);
  };

  const handleRemove = (productId: string, variantId: string) => {
    removeItem(productId, variantId);
    toast.info("Item removed from your bag.");
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            ref={drawerRef}
            tabIndex={-1}
            className="fixed top-0 right-0 h-[100dvh] w-full sm:w-[440px] bg-background shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-heading"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 id="cart-heading" className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> 
                Your Bag ({items.length})
              </h2>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close cart"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-lg">Your bag is empty.</p>
                  <Button onClick={() => setDrawerOpen(false)} variant="outline">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        layout
                        key={`${item.productId}-${item.variantId}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex gap-4"
                      >
                        <div className="w-20 h-24 bg-muted rounded-md overflow-hidden shrink-0">
                          {item.imagePath ? (
                            <img src={item.imagePath} alt={item.productName || "Product"} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-neutral-200" />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium line-clamp-1">{item.productName}</h3>
                              <span className="font-semibold ml-2">${((item.priceMinor || 0) / 100).toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border rounded-md">
                              <button 
                                onClick={() => handleDecrease(item.productId, item.variantId, item.quantity)}
                                className="min-h-10 min-w-10 flex items-center justify-center text-muted-foreground hover:text-foreground"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-medium px-2">{item.quantity}</span>
                              <button 
                                onClick={() => handleIncrease(item.productId, item.variantId, item.quantity)}
                                className="min-h-10 min-w-10 flex items-center justify-center text-muted-foreground hover:text-foreground"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button 
                              onClick={() => handleRemove(item.productId, item.variantId)}
                              className="text-xs text-muted-foreground hover:text-destructive underline transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t p-4 bg-muted/20 space-y-4">
                <div className="flex justify-between text-base font-medium">
                  <span>Subtotal</span>
                  <span>${(subtotal / 100).toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="grid gap-2">
                  <Link href="/cart" onClick={() => setDrawerOpen(false)} className={buttonVariants({ variant: "outline", className: "w-full" })}>View Bag</Link>
                  <Link href="/checkout" onClick={() => setDrawerOpen(false)} className={buttonVariants({ className: "w-full h-12 text-base" })}>Checkout</Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
