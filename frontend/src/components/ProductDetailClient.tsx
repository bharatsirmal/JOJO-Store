"use client";

import { useState } from "react";
import { CatalogProduct, ProductVariant } from "@/types";
import { useCartStore } from "@/lib/store/cartStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronLeft, ChevronRight, Plus, Minus, Truck, RotateCcw, Wrench, ChevronDown, Star } from "lucide-react";

interface Props {
  product: CatalogProduct;
  variants: ProductVariant[];
}

export function ProductDetailClient({ product, variants }: Props) {
  
  const defaultColor = product.colorVariants && product.colorVariants.length > 0 
    ? product.colorVariants[0].colorName 
    : "";
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);
  const [quantity, setQuantity] = useState(1);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

  const activeColorVariant = product.colorVariants?.find(cv => cv.colorName === selectedColor);
  
  const images = activeColorVariant?.imagePaths?.length 
     ? activeColorVariant.imagePaths 
     : (product.imagePaths.length > 0 ? product.imagePaths : ["https://placehold.co/600x800/eeeeee/999999?text=No+Image"]);


  const uniqueSizes = Array.from(new Set(variants.map(v => v.size))).filter(Boolean);
  if (uniqueSizes.length === 0 && product.sizes) {
    uniqueSizes.push(...product.sizes);
  }
  
  const uniqueColors = Array.from(new Set(variants.map(v => v.color))).filter(Boolean);
  if (uniqueColors.length === 0 && product.colors) {
    uniqueColors.push(...product.colors);
  }
  const addItem = useCartStore(state => state.addItem);

  const price = product.basePriceMinor / 100;
  const formattedPrice = price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`;

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const isAddToCartDisabled = (uniqueSizes.length > 0 && !selectedSize) || (uniqueColors.length > 0 && !selectedColor);

  const handleAddToCart = () => {
    if (uniqueSizes.length > 0 && !selectedSize) {
      toast.warning("Please select a size");
      return;
    }
    if (uniqueColors.length > 0 && !selectedColor) {
      toast.warning("Please select a colour");
      return;
    }
    
    // Find the matching variant. If none specific, use a fallback
    const selectedVariant = variants.find(v => 
      (!uniqueSizes.length || v.size === selectedSize) && 
      (!uniqueColors.length || v.color === selectedColor)
    );
    
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id || `${product.id}-default`,
      quantity: quantity,
      addedAt: new Date().toISOString(),
      productName: product.name,
      size: selectedSize,
      color: selectedColor,
      priceMinor: selectedVariant ? selectedVariant.priceMinor : product.basePriceMinor,
      imagePath: images[0]
    });
    toast.success("Added to your bag.");
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-[1200px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* LEFT: Gallery */}
        <div className="flex flex-col gap-3 w-full">
          <div className="relative w-full aspect-[0.8/1] overflow-hidden bg-transparent group">
            <AnimatePresence initial={false}>
              <motion.img 
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={`${product.name} - image ${currentImageIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 w-full h-full object-contain object-center mix-blend-multiply"
              />
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10 shadow-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleNextImage}
                  className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10 shadow-sm"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative flex-shrink-0 w-[67px] h-[84px] transition-all duration-200 ${currentImageIndex === idx ? 'opacity-100 outline outline-1 outline-slate-900 outline-offset-[-1px]' : 'opacity-50 hover:opacity-100 outline outline-1 outline-transparent'}`}
                >
                  <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Info */}
        <div className="flex flex-col text-slate-900">
          <div className="text-slate-500 text-[15px] mb-2 font-medium capitalize">
            {product.categoryId}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-6 mb-6">
            <span className="text-2xl font-bold tracking-tight">{formattedPrice}</span>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map(i => <Star key={i} className="w-4 h-4 fill-slate-800 text-slate-800" />)}
                <Star className="w-4 h-4 fill-slate-300 text-slate-300" />
              </div>
              <span className="ml-1 tracking-wide">4.0 · 91 reviews</span>
            </div>
          </div>

          <div className="text-[17px] leading-relaxed text-slate-600 mb-8 max-w-[95%]">
            {product.description || "A packable liner that wears alone or under the Halden."}
          </div>

          {/* Colours */}
          {product.colorVariants && product.colorVariants.length > 0 ? (
            <div className="mb-8">
              <div className="text-[13px] font-bold text-slate-900 mb-4 tracking-wide uppercase">
                COLOUR: <span className="font-normal text-slate-600 ml-1">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colorVariants.map(cv => (
                  <button 
                    key={cv.colorName}
                    onClick={() => {
                      setSelectedColor(cv.colorName);
                      setCurrentImageIndex(0);
                    }}
                    className={`w-[70px] aspect-[0.75/1] border overflow-hidden transition-all ${selectedColor === cv.colorName ? 'border-slate-900 shadow-md scale-[1.02]' : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-300'}`}
                  >
                     {cv.imagePaths[0] ? (
                        <img src={cv.imagePaths[0]} alt={cv.colorName} className="w-full h-full object-cover mix-blend-multiply" />
                     ) : (
                        <div className="w-full h-full bg-slate-200" />
                     )}
                  </button>
                ))}
              </div>
            </div>
          ) : uniqueColors.length > 0 && (
            <div className="mb-8">
              <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-4">
                Colour
              </div>
              <div className="flex gap-3">
                {uniqueColors.map(color => {
                  // Extremely basic fallback mapping for color names to CSS colors, purely for matching the aesthetic
                  const bgMap: Record<string, string> = {
                    'slate': 'bg-slate-500',
                    'black': 'bg-slate-900',
                    'sand': 'bg-[#D9CFBE]',
                    'white': 'bg-white',
                    'navy': 'bg-blue-900'
                  };
                  const bgClass = bgMap[color.toLowerCase()] || 'bg-slate-200';

                  return (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selectedColor === color ? 'border border-slate-900' : 'border border-transparent hover:border-slate-300'}`}
                      aria-label={color}
                      title={color}
                    >
                      <span className={`w-7 h-7 rounded-full border border-slate-200 ${bgClass}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buy Row */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500">
                {uniqueSizes.length > 0 ? "Select a size" : "Quantity"}
              </div>
              {uniqueSizes.length > 0 && (
                <button className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500 hover:text-slate-900 transition-colors">
                  Size guide
                </button>
              )}
            </div>

            {uniqueSizes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {uniqueSizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] h-12 px-3 border flex items-center justify-center text-[13px] font-medium transition-colors ${selectedSize === size ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 text-slate-900 hover:border-slate-900'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2.5 w-full bg-white rounded-sm">
              <div className="flex flex-row gap-2.5 w-full h-[52px]">
                <div className="flex items-center bg-[#1a1a1a] text-white w-[120px] shrink-0 h-full border border-[#2a2a2a]">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex-1 h-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#2a2a2a] transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-8 text-center text-[15px] font-bold">{quantity}</div>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex-1 h-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#2a2a2a] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={isAddToCartDisabled}
                  className="flex-1 h-full flex items-center justify-center bg-[#F1F0E9] text-[#111111] text-[13px] font-semibold tracking-wide uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#EAEAEA]"
                >
                  {isAddToCartDisabled ? "Select options" : "Add to bag"}
                </button>
              </div>

              <button 
                onClick={() => {
                  handleAddToCart();
                }}
                disabled={isAddToCartDisabled}
                className="w-full h-[52px] flex items-center justify-center bg-[#FF5A36] text-white text-[13px] font-bold tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E04D2C]"
              >
                Buy Now — Secure Checkout →
              </button>
            </div>
          </div>

          {/* Wishlist */}
          <div className="mb-10">
            <button 
              onClick={() => toast.info("Saved for later")}
              className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-500 hover:text-slate-900 transition-colors h-10"
            >
              <Heart className="w-[17px] h-[17px]" />
              Save for later
            </button>
          </div>

          {/* Trust */}
          <div className="space-y-4 mb-10 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-4 text-slate-600">
              <Truck className="w-5 h-5 shrink-0" />
              <span className="text-[15px]">Free carbon-neutral shipping over $200</span>
            </div>
            <div className="flex items-center gap-4 text-slate-600">
              <RotateCcw className="w-5 h-5 shrink-0" />
              <span className="text-[15px]">Thirty days to change your mind</span>
            </div>
            <div className="flex items-center gap-4 text-slate-600">
              <Wrench className="w-5 h-5 shrink-0" />
              <span className="text-[15px]">Two years of free repairs, in-house</span>
            </div>
          </div>

          {/* Accordions */}
          <div className="border-t border-slate-200">
            {[
              { title: "Materials", content: product.material || "Crafted with premium materials." },
              { title: "Care instructions", content: product.careInstructions || "Machine wash cold with like colors." },
              { title: "Shipping & returns", content: product.shippingReturns || "Free shipping over $200. Returns within 30 days." }
            ].map((section) => (
              <div key={section.title} className="border-b border-slate-200">
                <button 
                  onClick={() => setExpandedAccordion(expandedAccordion === section.title ? null : section.title)}
                  className="w-full py-5 flex justify-between items-center text-left hover:opacity-70 transition-opacity"
                >
                  <span className="text-[17px] font-bold tracking-tight text-slate-900">{section.title}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedAccordion === section.title ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedAccordion === section.title && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden text-slate-600 pb-5"
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-line">
                        {section.content}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
