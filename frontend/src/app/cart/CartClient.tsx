"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";
import { toast } from "sonner";
import { fadeUp } from "@/lib/animations";

export function CartClient() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return null; // Avoid hydration mismatch
  
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

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <ShoppingBag className="w-20 h-20 text-muted-foreground/30" />
        <h1 className="text-3xl font-bold tracking-tight">Your bag is empty</h1>
        <p className="text-muted-foreground max-w-md">
          Looks like you haven&apos;t added anything yet. Discover our latest collection to find something you love.
        </p>
        <Link href="/products">
          <Button size="lg" className="mt-4">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-10">Your Bag</h1>
      
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="w-full lg:flex-1">
          <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-4 mb-6">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
          
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                layout
                key={`${item.productId}-${item.variantId}`}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-6 border-b"
              >
                {/* Product Info */}
                <div className="col-span-1 md:col-span-6 flex gap-4">
                  <Link href={`/products/${item.productId}`} className="w-24 h-32 bg-muted rounded-md overflow-hidden shrink-0">
                    {item.imagePath ? (
                      <img src={item.imagePath} alt={item.productName || "Product"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-neutral-200" />
                    )}
                  </Link>
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <Link href={`/products/${item.productId}`} className="font-medium hover:underline line-clamp-2">
                        {item.productName}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleRemove(item.productId, item.variantId)}
                      className="text-sm text-muted-foreground hover:text-destructive underline text-left w-fit"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                {/* Mobile Price Display */}
                <div className="md:hidden flex justify-between items-center mt-4">
                  <span className="font-medium">${((item.priceMinor || 0) / 100).toFixed(2)}</span>
                  
                  {/* Quantity Controls Mobile */}
                  <div className="flex items-center border rounded-md">
                    <button onClick={() => handleDecrease(item.productId, item.variantId, item.quantity)} className="p-2 text-muted-foreground hover:text-foreground">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium px-4">{item.quantity}</span>
                    <button onClick={() => handleIncrease(item.productId, item.variantId, item.quantity)} className="p-2 text-muted-foreground hover:text-foreground">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quantity Controls Desktop */}
                <div className="hidden md:flex col-span-2 justify-center">
                  <div className="flex items-center border rounded-md">
                    <button onClick={() => handleDecrease(item.productId, item.variantId, item.quantity)} className="p-2 text-muted-foreground hover:text-foreground">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium px-4">{item.quantity}</span>
                    <button onClick={() => handleIncrease(item.productId, item.variantId, item.quantity)} className="p-2 text-muted-foreground hover:text-foreground">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price Desktop */}
                <div className="hidden md:block col-span-2 text-right text-muted-foreground">
                  ${((item.priceMinor || 0) / 100).toFixed(2)}
                </div>

                {/* Total Desktop */}
                <div className="hidden md:block col-span-2 text-right font-medium">
                  ${(((item.priceMinor || 0) * item.quantity) / 100).toFixed(2)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[380px] shrink-0 sticky top-24">
          <div className="bg-muted/30 p-6 rounded-xl border">
            <h2 className="text-lg font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${(subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-sm text-muted-foreground italic">Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes</span>
                <span className="text-sm text-muted-foreground italic">Calculated at checkout</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-8">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Estimated Total</span>
                <span>${(subtotal / 100).toFixed(2)}</span>
              </div>
            </div>
            
            <Link href="/checkout">
              <Button size="lg" className="w-full h-14 text-base font-medium flex items-center justify-between px-6">
                Continue to Checkout <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
