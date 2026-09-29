import { requireAdmin } from "@/lib/auth/server";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft, Box, Shirt } from "lucide-react";

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div className="space-y-6 pb-12 max-w-[1400px] mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <Link href="/admin/products" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Products
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl border border-blue-100 shadow-sm hidden sm:block">
              <Box className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Add New Product</h1>
              <p className="text-slate-500 mt-1">Create a new clothing item in your catalog.</p>
            </div>
          </div>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}
