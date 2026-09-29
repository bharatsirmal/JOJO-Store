"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animations";
import { CatalogProduct } from "@/types";
import { Heart, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { toast } from "sonner";

interface ProductCardProps {
  product: CatalogProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  
  const primaryImage = product.imagePaths[0] || "https://placehold.co/600x800/eeeeee/999999?text=No+Image";
  const hoverImage = product.imagePaths[1] || primaryImage; // Use second image for hover if available
  
  // Format price without decimals if it's a whole number
  const price = product.basePriceMinor / 100;
  const formattedPrice = price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`;
  
  let formattedOfferPrice = null;
  if (product.offerPriceMinor) {
    const offerPrice = product.offerPriceMinor / 100;
    formattedOfferPrice = offerPrice % 1 === 0 ? `$${offerPrice}` : `$${offerPrice.toFixed(2)}`;
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Quick add default variant/size (for demonstration)
    addItem({
      productId: product.id,
      variantId: `${product.id}-default`,
      productName: product.name,
      priceMinor: product.offerPriceMinor || product.basePriceMinor,
      imagePath: primaryImage,
      quantity: 1,
      size: "M" // Default fallback size
    });
    toast.success("Added to bag");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info("Saved to wishlist");
  };
  
  return (
    <motion.div variants={scaleIn} className="product-card group relative flex flex-col gap-3">
      {/* Image Container */}
      <div className="product-media relative aspect-[3/4] overflow-hidden rounded-xl bg-[#f5f5f5]">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0">
          <img 
            src={primaryImage} 
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 group-hover:opacity-0 mix-blend-multiply"
            loading="lazy"
          />
          <img 
            src={hoverImage} 
            alt={`${product.name} alternate`}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:scale-105 transition-transform mix-blend-multiply"
            loading="lazy"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {(product.featured || product.isBestseller) && (
            <span className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
              Bestseller
            </span>
          )}
          {product.isNew && (
            <span className="bg-white text-slate-900 border border-slate-200 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
              New
            </span>
          )}
          {product.offerPriceMinor && product.offerPriceMinor < product.basePriceMinor && (
            <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
              Sale
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist}
          className="product-wishlist absolute top-3 right-3 z-10 w-11 h-11 rounded-full bg-white flex items-center justify-center text-slate-900 transition-all duration-300 shadow-sm hover:bg-slate-50 hover:scale-105 active:scale-95"
          aria-label="Save to wishlist"
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* Quick Add Button */}
        <div className="product-actions absolute bottom-3 left-0 right-0 flex justify-center z-10 transition-all duration-300">
          <button 
            onClick={handleQuickAdd}
            className="bg-white text-slate-900 text-xs font-semibold px-4 min-h-11 py-2 rounded-full shadow-md flex items-center gap-1.5 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add to bag
          </button>
        </div>
      </div>
      
      {/* Info Container */}
      <div className="flex flex-col gap-0.5 px-1">
        <div className="flex justify-between items-start gap-2">
          <Link href={`/products/${product.slug}`} className="font-semibold text-slate-900 hover:text-slate-600 transition-colors line-clamp-1 text-sm sm:text-base">
            {product.name}
          </Link>
          <div className="flex flex-col items-end shrink-0">
            {formattedOfferPrice ? (
               <>
                 <span className="text-red-600 font-semibold text-sm sm:text-base">{formattedOfferPrice}</span>
                 <span className="text-slate-400 font-medium text-xs line-through">{formattedPrice}</span>
               </>
             ) : (
               <span className="text-slate-900 font-semibold text-sm sm:text-base">{formattedPrice}</span>
             )}
          </div>
        </div>
        <span className="text-slate-500 text-sm font-medium">
          {product.categoryId}
        </span>
      </div>
    </motion.div>
  );
}
