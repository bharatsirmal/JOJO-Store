import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import { CatalogProduct } from "@/types";
import { Package, Layers, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  if (!adminDb) {
    return <div className="p-8">Firebase Admin not configured.</div>;
  }

  // Fetch all products to calculate category stats
  const snapshot = await adminDb.collection("products").get();
  
  const products = snapshot.docs.map(doc => doc.data() as CatalogProduct);

  // Group products by category
  const categoryStats: Record<string, { count: number, active: number }> = {};
  
  // Standard categories we always want to show even if empty
  const standardCategories = ["T-Shirts", "Shirts", "Jeans", "Hoodies", "Dresses", "Accessories"];
  standardCategories.forEach(cat => {
    categoryStats[cat] = { count: 0, active: 0 };
  });

  // Calculate actual counts
  products.forEach(p => {
    const cat = p.categoryId;
    if (!cat) return;
    if (!categoryStats[cat]) {
      categoryStats[cat] = { count: 0, active: 0 };
    }
    categoryStats[cat].count++;
    if (p.status === 'active') {
      categoryStats[cat].active++;
    }
  });

  // Format into array for rendering
  const categoriesList = Object.entries(categoryStats).map(([name, stats]) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    ...stats
  })).sort((a, b) => b.count - a.count);

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      't-shirts': 'bg-indigo-100 text-indigo-700',
      'hoodies': 'bg-blue-100 text-blue-700',
      'accessories': 'bg-pink-100 text-pink-700',
      'footwear': 'bg-blue-100 text-blue-700',
      'jackets': 'bg-purple-100 text-purple-700',
      'jeans': 'bg-cyan-100 text-cyan-700',
      'shirts': 'bg-orange-100 text-orange-700',
      'dresses': 'bg-rose-100 text-rose-700',
    };
    return map[cat.toLowerCase()] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Categories</h1>
          <p className="text-[15px] text-slate-500 mt-1">Manage your store's clothing catalog structure.</p>
        </div>
        <Button className="bg-[#5c5cff] hover:bg-[#4b4be5] text-white gap-2 h-10 px-4 rounded-lg shadow-sm">
          <Layers className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search categories..." 
              className="pl-9 bg-slate-50 border-transparent focus-visible:ring-1 focus-visible:ring-[#5c5cff]"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
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
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Total Products</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoriesList.map((cat) => (
                <tr key={cat.name} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border border-white/50 shadow-sm ${getCategoryColor(cat.name)}`}>
                        <Layers className="h-5 w-5" />
                      </div>
                      <div className="font-semibold text-slate-900">{cat.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">/{cat.slug}</code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-700">{cat.count} items</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" className="text-[#5c5cff] hover:text-[#4b4be5] hover:bg-indigo-50 font-medium">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
