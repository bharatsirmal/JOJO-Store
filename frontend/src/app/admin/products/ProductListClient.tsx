"use client";

import { useState } from "react";
import Link from "next/link";
import { CatalogProduct } from "@/types";
import { Search, Filter, ChevronLeft, ChevronRight, Package, Box, PauseCircle, AlertCircle, Edit, Copy, Trash2, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDialogFocus } from "@/lib/useDialogFocus";

export function ProductListClient({ initialProducts }: { initialProducts: CatalogProduct[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<CatalogProduct | null>(null);
  const confirmRef = useDialogFocus(showConfirmModal, () => {
    if (!deletingId) { setShowConfirmModal(false); setProductToDelete(null); }
  });

  // Calculate metrics
  const total = initialProducts.length;
  const activeCount = initialProducts.filter(p => p.status === "active").length;
  const inactiveCount = initialProducts.filter(p => p.status !== "active").length;
  const outOfStockCount = 0; // Requires fetching variants

  const getPercentage = (count: number) => total > 0 ? Math.round((count / total) * 100) : 0;

  // Filter products
  const filteredProducts = initialProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (true && "Multiple SKUs".toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Product removed");
      setShowConfirmModal(false);
      setProductToDelete(null);
      router.refresh();
    } catch (e: any) {
      toast.error("Error deleting product");
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      't-shirts': 'bg-indigo-100 text-indigo-700',
      'hoodies': 'bg-blue-100 text-blue-700',
      'accessories': 'bg-pink-100 text-pink-700',
      'footwear': 'bg-blue-100 text-blue-700',
      'jackets': 'bg-purple-100 text-purple-700',
    };
    return map[cat.toLowerCase()] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="bg-[#f0f0ff] h-12 w-12 rounded-full flex items-center justify-center text-[#5c5cff]">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{total}</div>
            <div className="text-sm font-medium text-slate-500">Total Products</div>
            <div className="text-xs font-semibold text-blue-500 mt-0.5">↑ +2 this month</div>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="bg-blue-50 h-12 w-12 rounded-full flex items-center justify-center text-blue-500">
            <div className="h-4 w-4 bg-blue-500 rounded-full" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{activeCount}</div>
            <div className="text-sm font-medium text-slate-500">Active Products</div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">{getPercentage(activeCount)}% of total</div>
          </div>
        </div>

        {/* Inactive Products */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="bg-amber-50 h-12 w-12 rounded-full flex items-center justify-center text-amber-500">
            <PauseCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{inactiveCount}</div>
            <div className="text-sm font-medium text-slate-500">Inactive Products</div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">{getPercentage(inactiveCount)}% of total</div>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="bg-red-50 h-12 w-12 rounded-full flex items-center justify-center text-red-500">
            <Box className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{outOfStockCount}</div>
            <div className="text-sm font-medium text-slate-500">Out of Stock</div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">{getPercentage(outOfStockCount)}% of total</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search products..." aria-label="Search products" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-transparent focus-visible:ring-1 focus-visible:ring-[#5c5cff]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select aria-label="Product category" className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm outline-none focus:ring-1 focus:ring-[#5c5cff]">
              <option>All Categories</option>
            </select>
            <select aria-label="Product status" className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm outline-none focus:ring-1 focus:ring-[#5c5cff]">
              <option>All Status</option>
            </select>
            <select aria-label="Product sort order" className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm outline-none focus:ring-1 focus:ring-[#5c5cff]">
              <option>Sort by: Latest</option>
            </select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-4 py-4 w-12 text-center">
                  <input aria-label="Select all products" type="checkbox" className="rounded border-slate-300 text-[#5c5cff] focus:ring-[#5c5cff]" />
                </th>
                <th className="px-4 py-4">Product</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Stock</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stock = 100; // Placeholder until variant aggregation is built
                  const isOutOfStock = false;
                  const isLowStock = stock > 0 && stock <= 10;
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-4 text-center">
                        <input aria-label={`Select ${p.name}`} type="checkbox" className="rounded border-slate-300 text-[#5c5cff] focus:ring-[#5c5cff]" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-md bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                            {p.imagePaths && p.imagePaths.length > 0 ? (
                              <img src={p.imagePaths[0]} alt={p.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{p.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">SKU: {"Multiple SKUs"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${getCategoryColor(p.categoryId)}`}>
                          {p.categoryId}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-900">
                        ${(p.basePriceMinor / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 rounded-full ${isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-blue-500'}`} />
                          <span className="font-medium text-slate-700">{stock}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {p.status === "active" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                            Active
                          </span>
                        ) : p.status === "draft" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                            {p.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="admin-row-actions flex items-center justify-end gap-1.5 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm" aria-label={`Edit ${p.name}`} onClick={() => router.push(`/admin/products/${p.id}/edit`)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm">
                            <Copy aria-label="Duplicate product" className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 shadow-sm"
                            onClick={() => {
                              setProductToDelete(p);
                              setShowConfirmModal(true);
                            }}
                            aria-label={`Delete ${p.name}`} disabled={deletingId === p.id}
                          >
                            {deletingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-white">
          <div>
            Showing 1 to {Math.min(filteredProducts.length, 5)} of {filteredProducts.length} products
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-slate-50"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" className="h-8 w-8 p-0 bg-[#5c5cff] text-white hover:bg-[#4b4be5] hover:text-white">1</Button>
            {filteredProducts.length > 5 && (
              <>
                <Button variant="ghost" className="h-8 w-8 p-0">2</Button>
                <Button variant="ghost" className="h-8 w-8 p-0">3</Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmModal && productToDelete && (
        <div ref={confirmRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="delete-product-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4 text-red-600">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 id="delete-product-title" className="text-lg font-semibold text-slate-900">Remove Product</h3>
            </div>
            
            <p className="mb-6 text-sm text-slate-500 pl-14">
              Are you absolutely sure you want to remove <strong>{productToDelete.name}</strong>? This action cannot be undone and it will be permanently deleted from your store.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowConfirmModal(false);
                  setProductToDelete(null);
                }}
                disabled={!!deletingId}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                onClick={() => handleDelete(productToDelete.id)}
                disabled={!!deletingId}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, remove product"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


