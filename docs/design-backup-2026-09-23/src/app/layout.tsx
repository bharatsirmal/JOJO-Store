import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import { CartDrawer } from "@/components/CartDrawer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className}>
        <NavbarWrapper>
          <Navbar />
        </NavbarWrapper>
        <CartDrawer />
        {children}
        <Toaster />
      </body>
    </html>
  );
}



