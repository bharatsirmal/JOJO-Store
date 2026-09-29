
const fs = require("fs");
const path = "src/components/SweatshirtCollection.tsx";

const newContent = `"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { CatalogProduct } from "@/types";

export function SweatshirtCollection({ products = [] }: { products?: CatalogProduct[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Card 1 animations
  const y1 = useTransform(scrollYProgress, [0, 0.33], [0, 0]);
  const scale1 = useTransform(scrollYProgress, [0, 0.33], [1, 0.95]);
  const shadow1 = useTransform(scrollYProgress, [0, 0.33], [0, 0.5]);

  // Card 2 animations
  const y2 = useTransform(scrollYProgress, [0, 0.33, 0.66], ["100%", "0%", "0%"]);
  const scale2 = useTransform(scrollYProgress, [0.33, 0.66], [1, 0.95]);
  const shadow2 = useTransform(scrollYProgress, [0.33, 0.66], [0, 0.5]);

  // Card 3 animations
  const y3 = useTransform(scrollYProgress, [0.33, 0.66], ["100%", "0%"]);

  if (!products || products.length === 0) return null;

  const largeCards = products.slice(0, 3);
  const smallCards = products.slice(3, 6);

  const getProductColor = (product: CatalogProduct, defaultColor: string) => {
    return product.colors && product.colors.length > 0 ? product.colors[0].hex : defaultColor;
  };

  const getProductImage = (product: CatalogProduct) => {
    return product.images && product.images.length > 0 ? product.images[0].url : "https://framerusercontent.com/images/A5rZp9q9bTGgoVGDpimnt2guF0.png";
  };

  return (
    <section className="bg-white text-black py-24 md:py-32 px-4 md:px-8 max-w-[1400px] mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-8">
        <h2 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.9]" style={{ fontFamily: "Impact, sans-serif" }}>
          Your everyday<br/>essential for<br/>premium comfort
        </h2>
        <div className="max-w-xs">
          <p className="text-gray-600 font-medium leading-relaxed">
            Designed for comfort, Made for everyday wear. Upgrade your wardrobe with our latest essentials.
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 mt-6 font-bold uppercase tracking-wider text-sm border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors">
            SHOP THE COLLECTION
          </Link>
        </div>
      </div>

      {/* Sticky Scroll Container */}
      <div ref={containerRef} className="h-[300vh] relative">
        <div className="sticky top-0 h-[100dvh] flex items-center justify-center overflow-hidden py-10 md:py-20">
          
          {/* Card 1 */}
          {largeCards[0] && (
            <motion.div style={{ y: y1, scale: scale1 }} className="absolute inset-x-0 mx-auto w-full max-w-6xl h-[80vh] md:h-[70vh] rounded-3xl overflow-hidden text-white shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.5)] origin-top z-10" style={{ backgroundColor: getProductColor(largeCards[0], "#904128"), y: y1, scale: scale1 }}>
              <motion.div style={{ opacity: shadow1 }} className="absolute inset-0 bg-black pointer-events-none z-50 transition-opacity duration-0" />
              <Link href={\`/products/\${largeCards[0].slug}\`} className="group block w-full h-full relative z-40">
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  <div className="relative w-full h-[300px] md:h-full overflow-hidden flex items-center justify-center p-8 md:p-10">
                    <img src={getProductImage(largeCards[0])} alt={largeCards[0].name} className="absolute inset-0 w-full h-full object-cover md:object-contain transition-transform duration-700 group-hover:scale-[1.15] scale-110" />
                  </div>
                  <div className="p-8 md:p-16 flex flex-col justify-center h-full">
                    <h3 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight uppercase" style={{ fontFamily: "Impact, sans-serif" }}>{largeCards[0].name}</h3>
                    <p className="text-base md:text-xl opacity-90 leading-relaxed mb-6 md:mb-8 max-w-md font-medium">{largeCards[0].description || "A clean everyday layer with a calm, elevated feel."}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl md:text-4xl font-extrabold">\${(largeCards[0].variants[0]?.priceMinor || 0) / 100}</span>
                      {largeCards[0].variants[0]?.compareAtPriceMinor && (
                        <span className="text-lg md:text-xl line-through opacity-70">\${largeCards[0].variants[0].compareAtPriceMinor / 100}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Card 2 */}
          {largeCards[1] && (
            <motion.div style={{ y: y2, scale: scale2 }} className="absolute inset-x-0 mx-auto w-full max-w-6xl h-[80vh] md:h-[70vh] rounded-3xl overflow-hidden text-white shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.5)] origin-top z-20" style={{ backgroundColor: getProductColor(largeCards[1], "#b49d83"), y: y2, scale: scale2 }}>
              <motion.div style={{ opacity: shadow2 }} className="absolute inset-0 bg-black pointer-events-none z-50 transition-opacity duration-0" />
              <Link href={\`/products/\${largeCards[1].slug}\`} className="group block w-full h-full relative z-40">
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  <div className="p-8 md:p-16 flex flex-col justify-center h-full order-2 md:order-1">
                    <h3 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight uppercase" style={{ fontFamily: "Impact, sans-serif" }}>{largeCards[1].name}</h3>
                    <p className="text-base md:text-xl opacity-90 leading-relaxed mb-6 md:mb-8 max-w-md font-medium">{largeCards[1].description || "A refined sweatshirt with a relaxed silhouette and muted finish."}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl md:text-4xl font-extrabold">\${(largeCards[1].variants[0]?.priceMinor || 0) / 100}</span>
                      {largeCards[1].variants[0]?.compareAtPriceMinor && (
                        <span className="text-lg md:text-xl line-through opacity-70">\${largeCards[1].variants[0].compareAtPriceMinor / 100}</span>
                      )}
                    </div>
                  </div>
                  <div className="relative w-full h-[300px] md:h-full overflow-hidden flex items-center justify-center p-8 md:p-10 order-1 md:order-2">
                    <img src={getProductImage(largeCards[1])} alt={largeCards[1].name} className="absolute inset-0 w-full h-full object-cover md:object-contain transition-transform duration-700 group-hover:scale-[1.15] scale-110" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Card 3 */}
          {largeCards[2] && (
            <motion.div style={{ y: y3 }} className="absolute inset-x-0 mx-auto w-full max-w-6xl h-[80vh] md:h-[70vh] rounded-3xl overflow-hidden text-white shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.5)] origin-top z-30" style={{ backgroundColor: getProductColor(largeCards[2], "#214668"), y: y3 }}>
              <Link href={\`/products/\${largeCards[2].slug}\`} className="group block w-full h-full relative z-40">
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  <div className="relative w-full h-[300px] md:h-full overflow-hidden flex items-center justify-center p-8 md:p-10">
                    <img src={getProductImage(largeCards[2])} alt={largeCards[2].name} className="absolute inset-0 w-full h-full object-cover md:object-contain transition-transform duration-700 group-hover:scale-[1.15] scale-110" />
                  </div>
                  <div className="p-8 md:p-16 flex flex-col justify-center h-full">
                    <h3 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight uppercase" style={{ fontFamily: "Impact, sans-serif" }}>{largeCards[2].name}</h3>
                    <p className="text-base md:text-xl opacity-90 leading-relaxed mb-6 md:mb-8 max-w-md font-medium">{largeCards[2].description || "A refined everyday essential with a calm, balanced presence."}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl md:text-4xl font-extrabold">\${(largeCards[2].variants[0]?.priceMinor || 0) / 100}</span>
                      {largeCards[2].variants[0]?.compareAtPriceMinor && (
                        <span className="text-lg md:text-xl line-through opacity-70">\${largeCards[2].variants[0].compareAtPriceMinor / 100}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

        </div>
      </div>

      {/* Small Cards */}
      {smallCards.length > 0 && (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24">
          {smallCards.map(product => (
            <motion.div key={product.id} variants={fadeUp}>
              <Link href={\`/products/\${product.slug}\`} className="group block w-full">
                <div className="relative w-full aspect-[4/5] bg-[#f5f5f5] rounded-xl overflow-hidden mb-5 shadow-sm">
                  <img src={getProductImage(product)} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div>
                  <h6 className="font-bold text-sm md:text-base tracking-wide text-black mb-1 uppercase truncate">{product.name}</h6>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm md:text-base text-black">\${(product.variants[0]?.priceMinor || 0) / 100}</span>
                    {product.variants[0]?.compareAtPriceMinor && (
                      <span className="text-sm md:text-base text-gray-500 line-through">\${product.variants[0].compareAtPriceMinor / 100}</span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
`;

fs.writeFileSync(path, newContent, "utf8");
console.log("Rewrite complete.");

