"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { CatalogProduct } from "@/types";

interface HomeClientProps {
  featuredProducts: CatalogProduct[];
}

export function HomeClient({ featuredProducts }: HomeClientProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-primary text-primary-foreground text-xs py-2 text-center tracking-wide font-medium">
        FREE SHIPPING ON ORDERS OVER $150
      </div>

      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/home_bg.png")' }}
        />
        <div className="absolute inset-0 bg-black/10 dark:bg-black/40" />
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center px-4 max-w-2xl"
        >
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            ELEVATE YOUR <br className="hidden md:block" /> EVERYDAY.
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground mb-8">
            Discover the new Fall/Winter collection. <br className="hidden md:block" /> Designed for modern life.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/products">
              <Button size="lg" className="h-12 px-8 rounded-full text-base">
                Shop the Collection
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-24 px-4 container mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Link href="/products?category=women" className="group block relative h-[400px] overflow-hidden bg-muted rounded-xl">
            <div className="absolute inset-0 bg-neutral-300 dark:bg-neutral-800 transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
            <div className="absolute bottom-8 left-8 flex items-center gap-2 text-white font-semibold text-2xl">
              Women <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
          
          <Link href="/products?category=men" className="group block relative h-[400px] overflow-hidden bg-muted rounded-xl">
            <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-700 transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
            <div className="absolute bottom-8 left-8 flex items-center gap-2 text-white font-semibold text-2xl">
              Men <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </motion.div>
      </section>

      <section className="py-16 px-4 container mx-auto">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Featured</h2>
          <Link href="/products" className="text-sm font-medium hover:underline flex items-center gap-1">
            Shop All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg border border-dashed">
            <p className="text-muted-foreground">New featured collection arriving soon.</p>
          </div>
        )}
      </section>

      <footer className="border-t bg-background py-12 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="font-bold mb-4">JOJO Store</h3>
            <p className="text-muted-foreground">Modern fashion for the everyday.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/products?category=new" className="hover:text-foreground">New Arrivals</Link></li>
              <li><Link href="/products?category=women" className="hover:text-foreground">Women</Link></li>
              <li><Link href="/products?category=men" className="hover:text-foreground">Men</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Help</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Shipping & Returns</Link></li>
              <li><Link href="#" className="hover:text-foreground">Size Guide</Link></li>
              <li><Link href="#" className="hover:text-foreground">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
