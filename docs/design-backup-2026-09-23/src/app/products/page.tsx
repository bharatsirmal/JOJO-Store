import { getPublishedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/SearchInput";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { id: "T-Shirts", label: "T-Shirts" },
  { id: "Shirts", label: "Shirts" },
  { id: "Jeans", label: "Jeans" },
  { id: "Hoodies", label: "Hoodies" },
  { id: "Dresses", label: "Dresses" },
  { id: "Accessories", label: "Accessories" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;
  
  const products = await getPublishedProducts({ categoryId: category, searchQuery: query, limit: 50 });

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px]">
      
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-200">
        
        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/products" scroll={false}>
            <div className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              !category 
                ? "bg-slate-900 text-white border border-slate-900" 
                : "bg-transparent text-slate-800 border border-slate-200 hover:border-slate-400"
            }`}>
              All pieces
            </div>
          </Link>
          
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <Link key={cat.id} href={`/products?category=${cat.id}`} scroll={false}>
                <div className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-slate-900 text-white border border-slate-900" 
                    : "bg-transparent text-slate-800 border border-slate-200 hover:border-slate-400"
                }`}>
                  {cat.label}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Search Field */}
        <div className="w-full md:w-auto">
          <SearchInput />
        </div>
      </div>

      {/* Product Grid */}
      <main>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <h3 className="font-semibold text-lg text-slate-800 mb-2">No pieces found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters or search criteria.</p>
            <Link href="/products">
              <Button className="rounded-full px-8">Clear Filters</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
