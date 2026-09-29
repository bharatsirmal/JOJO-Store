import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  setDrawerOpen: (isOpen: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  mergeCart: (serverCartItems: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isDrawerOpen: false,
      
      setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
      
      addItem: (item) => set((state) => {
        const existingItemIndex = state.items.findIndex(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );
        
        if (existingItemIndex > -1) {
          const updatedItems = [...state.items];
          updatedItems[existingItemIndex].quantity += item.quantity;
          return { items: updatedItems, isDrawerOpen: true };
        }
        
        return { items: [...state.items, item], isDrawerOpen: true };
      }),
      
      removeItem: (productId, variantId) => set((state) => ({
        items: state.items.filter(
          (i) => !(i.productId === productId && i.variantId === variantId)
        )
      })),
      
      updateQuantity: (productId, variantId, quantity) => set((state) => {
        if (quantity <= 0) {
          return {
            items: state.items.filter(
              (i) => !(i.productId === productId && i.variantId === variantId)
            )
          };
        }
        
        return {
          items: state.items.map((i) => 
            (i.productId === productId && i.variantId === variantId)
              ? { ...i, quantity }
              : i
          )
        };
      }),
      
      clearCart: () => set({ items: [] }),
      
      mergeCart: (serverCartItems) => set((state) => {
        // Basic deterministic merge: server wins for matching items, otherwise append.
        // In a full production app, this would be more complex and validated securely.
        const merged = [...state.items];
        
        serverCartItems.forEach(serverItem => {
          const existing = merged.findIndex(i => i.productId === serverItem.productId && i.variantId === serverItem.variantId);
          if (existing > -1) {
             merged[existing].quantity = Math.max(merged[existing].quantity, serverItem.quantity);
          } else {
             merged.push(serverItem);
          }
        });
        
        return { items: merged };
      }),
    }),
    {
      name: "jojo-store-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items, not UI state like isDrawerOpen
    }
  )
);
