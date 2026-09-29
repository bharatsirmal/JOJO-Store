import React from "react";
import { createRoot } from "react-dom/client";
import { AdminShell } from "../src/components/admin/AdminShell";
import { DashboardOverview } from "../src/components/admin/DashboardOverview";
import { ProductListClient } from "../src/app/admin/products/ProductListClient";
import { MotionProvider } from "../src/components/MotionProvider";
import { usePathname } from "./navigation";
import "../src/app/globals.css";
import "./preview.css";

// Isolated visual fixture. No Firebase imports, credentials, or production API calls.
window.fetch = async () => new Response(JSON.stringify({ error: "Design preview: data actions are disabled." }), { status: 403 });
const products = [
  { id: "sample-1", name: "Everyday Cotton Hoodie", slug: "sample-hoodie", categoryId: "Hoodies", basePriceMinor: 6800, status: "active", stockQuantity: 24, sku: "PREVIEW-001", imagePaths: ["/home_bg.png"] },
  { id: "sample-2", name: "Relaxed Essential Tee", slug: "sample-tee", categoryId: "T-Shirts", basePriceMinor: 3200, status: "active", stockQuantity: 8, sku: "PREVIEW-002", imagePaths: [] },
  { id: "sample-3", name: "The Weekend Shirt", slug: "sample-shirt", categoryId: "Shirts", basePriceMinor: 5400, status: "draft", stockQuantity: 0, sku: "PREVIEW-003", imagePaths: [] },
];
function Preview() {
  const path = usePathname();
  return <MotionProvider><AdminShell userEmail="preview@example.test" userName="Design Preview" userRole="admin">
    <div className="mx-4 sm:mx-8 mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">Design preview · Sample data · Data actions disabled</div>
    {path === "/admin/products" ? <div className="p-4 sm:p-8"><h1 className="text-3xl font-bold mb-6">Products</h1><ProductListClient initialProducts={products} /></div> :
    <DashboardOverview totalRevenueFormatted="$12,480.00" totalOrders={148} activeProductsCount={32} customersCount={96}
      recentOrders={[{ id: "sample-order", customerName: "Sample Customer", status: "processing", totalMinor: 6800 }]}
      topProducts={products} />}
  </AdminShell></MotionProvider>;
}
createRoot(document.getElementById("root")).render(<Preview />);
