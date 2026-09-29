import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CatalogProduct } from "@/types";
import { ProductListClient } from "./ProductListClient";

export default async function AdminProductsPage() {
  await requireAdmin();

  if (!adminDb) {
    return <div className="p-8">Firebase Admin not configured.</div>;
  }

  const snapshot = await adminDb.collection("products").orderBy("createdAt", "desc").get();
  
  const products = snapshot.docs.map(doc => {
    const rawData = doc.data();
    return {
      id: doc.id,
      ...rawData,
      createdAt: rawData?.createdAt?.toDate ? rawData.createdAt.toDate().toISOString() : rawData?.createdAt,
      updatedAt: rawData?.updatedAt?.toDate ? rawData.updatedAt.toDate().toISOString() : rawData?.updatedAt,
    };
  }) as CatalogProduct[];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-[15px] text-slate-500 mt-1">Manage your store's product catalog. Add, edit or remove products.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-[#5c5cff] hover:bg-[#4b4be5] text-white gap-2 h-10 px-4 rounded-lg shadow-sm">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <ProductListClient initialProducts={products} />
    </div>
  );
}
