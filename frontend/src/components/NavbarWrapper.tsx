"use client";

import { usePathname } from "next/navigation";

export function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/delivery") || pathname?.startsWith("/checkout")) {
    return null;
  }
  
  return <>{children}</>;
}
