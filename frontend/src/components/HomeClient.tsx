"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { ArrowDown, ArrowUpRight, ArrowRight, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { CatalogProduct } from "@/types";
import { SweatshirtCollection } from "@/components/SweatshirtCollection";

export function HomeClient({ featuredProducts }: { featuredProducts: CatalogProduct[] }) {
  return (
    <main id="main-content" className="store-home">
      <section className="relative w-full bg-[#0a0a0a]">
        <img src="/home_bg.png" alt="JOJO storefront background" fetchPriority="high" className="w-full h-auto block" />
      </section>

      {/* New Arrivals Section (Moved up!) */}
      <section className="store-section featured-section">
        <div className="section-heading">
          <div><p className="eyebrow">LATEST DROPS</p><h2>New Arrivals.</h2></div>
          <Link href="/products" className="text-link">Shop All <ArrowRight size={17} /></Link>
        </div>
        {featuredProducts.length > 0 ? (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6">
            {featuredProducts.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}
          </motion.div>
        ) : (
          <div className="collection-empty"><ShoppingBag size={32} strokeWidth={1.3} /><h3>Your next favourites are on their way.</h3><p>New arrivals coming soon.</p><Link href="/products" className="text-link">Explore all pieces <ArrowRight size={16} /></Link></div>
        )}
      </section>

      {/* Bento Grid Categories Section */}
      <section className="mb-24 px-5 sm:px-8 lg:px-12 max-w-[1400px] mx-auto scroll-mt-24" id="collections">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-10 tracking-tight text-left uppercase">Shop by Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
          
          {/* Top Left - Men */}
          <div className="relative rounded-[12px] overflow-hidden bg-[#e5e5e5] group h-auto aspect-auto">
            <img src="/man.jpg" alt="Men" className="w-full h-auto object-cover object-center transition-transform duration-700 group-hover:scale-105 block" />
            <div className="absolute inset-0 bg-black/5 transition-opacity duration-300 group-hover:bg-black/10" />
            
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between z-10">
              <div>
                <p className="text-gray-500 font-medium text-sm tracking-tight mb-2">FOR MEN</p>
                
              </div>
              <div>
                <Link href="/products?category=men" className="inline-block bg-gray-500 text-white font-medium px-[18px] py-[10px] text-[16px] rounded-[10px] hover:bg-gray-600 transition-colors shadow-sm">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* Top Right - Women */}
          <div className="relative rounded-[12px] overflow-hidden bg-[#e5e5e5] group h-auto aspect-auto">
            <img src="/woman.jpg" alt="Women" className="w-full h-auto object-cover object-[50%_20%] transition-transform duration-700 group-hover:scale-105 block" />
            <div className="absolute inset-0 bg-black/5 transition-opacity duration-300 group-hover:bg-black/10" />
            
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between z-10">
              <div>
                <p className="text-gray-500 font-medium text-sm tracking-tight mb-2">FOR WOMEN</p>
                
              </div>
              <div>
                <Link href="/products?category=women" className="inline-block bg-gray-500 text-white font-medium px-[18px] py-[10px] text-[16px] rounded-[10px] hover:bg-gray-600 transition-colors shadow-sm">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Left - Accessories */}
          <div className="relative rounded-[12px] overflow-hidden bg-[#e5e5e5] group h-auto aspect-[1104/1425]">
            <img src="/accessories.avif" alt="Accessories" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/5 transition-opacity duration-300 group-hover:bg-black/10" />
            
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between z-10">
              <div>
                <p className="text-gray-800 font-medium text-sm tracking-tight mb-2">FOR ACCESSORIES</p>
                
              </div>
              <div>
                <Link href="/products?category=accessories" className="inline-block bg-gray-500 text-white font-medium px-[18px] py-[10px] text-[16px] rounded-[10px] hover:bg-gray-600 transition-colors shadow-sm">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Right - Footwear */}
          <div className="relative rounded-[12px] overflow-hidden bg-[#e5e5e5] group h-auto aspect-[1104/1425]">
            <img src="/footwear.png" alt="Footwear" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/5 transition-opacity duration-300 group-hover:bg-black/10" />
            
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between z-10">
              <div>
                <p className="text-gray-800 font-medium text-sm tracking-tight mb-2">FOR FOOTWEAR</p>
                
              </div>
              <div>
                <Link href="/products?category=footwear" className="inline-block bg-gray-500 text-white font-medium px-[18px] py-[10px] text-[16px] rounded-[10px] hover:bg-gray-600 transition-colors shadow-sm">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* New Sweatshirt Design Section */}
      {/* Pass comfort section products, fallback to featured products if none marked */}
      <SweatshirtCollection products={featuredProducts.filter(p => p.isComfortSection).length > 0 ? featuredProducts.filter(p => p.isComfortSection) : featuredProducts} />

      {/* Full-width Screenfit Video Section with Overlaid Text */}
      <section className="relative w-full h-[80vh] md:h-[90vh] mt-20 mb-20 flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        <video 
          src="/video.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle dark gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Overlaid Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-3 sm:mb-5 tracking-tight" 
            style={{ fontFamily: "Impact, sans-serif" }}
          >
            Our Story, Your Style
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl font-medium max-w-2xl mb-6 sm:mb-8 leading-relaxed"
          >
            Crafting timeless fashion with quality,<br className="hidden sm:block" /> innovation, and sophistication at the core
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/about" className="bg-white text-black font-semibold text-xs sm:text-sm px-8 py-3 sm:px-10 sm:py-4 hover:bg-gray-200 transition-colors shadow-lg">
              ABOUT US
            </Link>
          </motion.div>
        </div>
      </section>
      
      <footer className="store-footer">
        <div className="footer-grid"><div><Link href="/" className="footer-wordmark">JOJO<span>Ar</span></Link><p>Modern fashion for the everyday.<br />A wardrobe that feels like you.</p></div>
          <div><h3>THE COLLECTION</h3><Link href="/products?category=new">New Arrivals</Link><Link href="/products?category=women">Women</Link><Link href="/products?category=men">Men</Link><Link href="/products">Shop All</Link></div>
          <div><h3>YOUR JOJO</h3><Link href="/account">My Account</Link><Link href="/account/orders">My Orders</Link><Link href="/wishlist">Wishlist</Link><Link href="/cart">Shopping Bag</Link></div>
          <div><h3>HELP & INFORMATION</h3><Link href="#">Shipping & Returns</Link><Link href="#">Size Guide</Link><Link href="#">Contact Us</Link><div className="footer-legal"><Link href="#">Privacy Policy</Link><Link href="#">Terms of Service</Link></div></div>
        </div>
        <div className="footer-bottom"><span>Ac {new Date().getFullYear()} JOJO Store</span><span>EVERYDAY LOOKS GOOD ON YOU.</span><a href="#main-content" className="text-link">Back to top</a></div>
      </footer>
    </main>
  );
}
