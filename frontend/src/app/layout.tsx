import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import { CartDrawer } from "@/components/CartDrawer";
import { Toaster } from "@/components/ui/sonner";
import { MotionProvider } from "@/components/MotionProvider";

const geist = localFont({ src: "./fonts/GeistVF.woff", display: "swap" });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents auto-zoom on mobile inputs
};

export const metadata: Metadata = {
  title: "JOJO Store",
  description: "Clothing Store E-Commerce Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth overscroll-none">
      <body className={`${geist.className} overscroll-none`}>
        <NextTopLoader color="#1d4ed8" initialPosition={0.08} crawlSpeed={200} height={3} crawl={true} showSpinner={false} easing="ease" speed={200} shadow="0 0 10px #1d4ed8,0 0 5px #1d4ed8" />
          <MotionProvider>
        <NavbarWrapper>
          <Navbar />
        </NavbarWrapper>
        <CartDrawer />
        {children}
        <Toaster />
        </MotionProvider>
      </body>
    </html>
  );
}



