"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { useDialogFocus } from "@/lib/useDialogFocus";

export function AdminShell({ children, userEmail, userName, userRole, userImage }: {
  children: React.ReactNode;
  userEmail: string;
  userName?: string;
  userRole?: string;
  userImage?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useDialogFocus(menuOpen, () => setMenuOpen(false));
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-content">Skip to content</a>
      <div className="admin-desktop-sidebar"><AdminSidebar /></div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader userEmail={userEmail} userName={userName} userRole={userRole} userImage={userImage} onMenuToggle={() => setMenuOpen(true)} menuOpen={menuOpen} />
        <main id="admin-content" tabIndex={-1} className="admin-page flex-1 overflow-y-auto relative">{children}</main>
      </div>
      {menuOpen && (
        <div className="admin-mobile-dialog" role="dialog" aria-modal="true" aria-label="Admin navigation" id="admin-mobile-navigation" ref={menuRef} tabIndex={-1}>
          <div className="admin-mobile-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div className="admin-mobile-panel">
            <button className="admin-close-menu" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={20} /></button>
            <AdminSidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
