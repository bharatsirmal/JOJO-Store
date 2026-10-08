"use client";

import Link from "next/link";
import Image from "next/image";
import men from "../../public/man.jpg";
import women from "../../public/woman.jpg";
import footwear from "../../public/footwear.png";
import { DeferredVideo } from "./DeferredVideo";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { CatalogProduct } from "@/types";
import { SweatshirtCollection } from "@/components/SweatshirtCollection";

export function HomeClient({ featuredProducts }: { featuredProducts: CatalogProduct[] }) {
  return (
    <div>

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

      <section className="mb-24 px-5 sm:px-8 lg:px-12 max-w-[1400px] mx-auto scroll-mt-24" id="collections" aria-labelledby="categories-heading">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#81734f] mb-2">Our Collection</p>
            <h2 id="categories-heading" className="text-2xl md:text-3xl font-semibold tracking-tight">Shop by Categories</h2>
            <p className="text-sm text-slate-600 mt-2 max-w-lg">Find your everyday favourites, from wardrobe essentials to finishing touches.</p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap shrink-0 pb-1 hover:underline">View All <ArrowRight size={16} /></Link>
        </div>

        <div className="grid grid-flow-col auto-cols-[76%] sm:auto-cols-[44%] md:grid-flow-row md:grid-cols-4 gap-4 lg:gap-6 overflow-x-auto snap-x snap-mandatory pb-3">
          {[
            { name: "Men", slug: "men", image: men, position: "object-center" },
            { name: "Women", slug: "women", image: women, position: "object-[50%_20%]" },
            { name: "Accessories", slug: "accessories", image: null, position: "object-center" },
            { name: "Footwear", slug: "footwear", image: footwear, position: "object-center" },
          ].map(category => (
            <Link key={category.slug} href={`/products?category=${category.slug}`} aria-label={`Shop ${category.name}`} className="group min-w-0 snap-start rounded-xl overflow-hidden bg-white/60 border border-black/[0.04] transition-shadow hover:shadow-md focus-visible:outline-offset-[-3px]">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#e5e5e5]">
                {category.image ? (
                  <Image src={category.image} fill sizes="(max-width: 639px) 76vw, (max-width: 767px) 44vw, (max-width: 1399px) 25vw, 310px" alt={category.name} className={`object-cover ${category.position} transition-transform duration-500 motion-safe:group-hover:scale-105`} />
                ) : (
                  <img src="/accessories.avif" loading="lazy" decoding="async" alt={category.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
                )}
              </div>
              <div className="px-4 py-5 lg:px-5">
                <h3 className="font-semibold text-base text-slate-900">{category.name}</h3>
                <span className="inline-flex items-center gap-2 mt-3 text-xs font-medium text-slate-700 group-hover:text-black">Shop Now <ArrowRight size={13} className="transition-transform motion-safe:group-hover:translate-x-1" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Sweatshirt Design Section */}
      {/* Pass comfort section products, fallback to featured products if none marked */}
      <SweatshirtCollection products={featuredProducts.filter(p => p.isComfortSection).length > 0 ? featuredProducts.filter(p => p.isComfortSection) : featuredProducts} />

      {/* Full-width Screenfit Video Section with Overlaid Text */}
      <section className="relative w-full h-[80vh] md:h-[90vh] mt-20 mb-20 flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        <DeferredVideo />
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
    </div>
  );
}
