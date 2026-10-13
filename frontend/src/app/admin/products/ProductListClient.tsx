"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CatalogProduct } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useDialogFocus } from "@/lib/useDialogFocus";
export function ProductListClient({
  initialProducts,
  initialCategory = "",
}: {
  initialProducts: CatalogProduct[];
  initialCategory?: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CatalogProduct | null>(null);
  const [busy, setBusy] = useState(false);
  const ref = useDialogFocus(!!selected, () => {
    if (!busy) setSelected(null);
  });
  const filtered = initialProducts
    .filter(
      (p) =>
        (!category || p.categoryId === category) &&
        (!status || p.status === status) &&
        [p.name, p.slug, p.categoryId]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "price"
          ? a.basePriceMinor - b.basePriceMinor
          : (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0),
    );
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, pages);
  async function remove() {
    if (!selected) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/products/${selected.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json();
        throw Error(result.error || "Unable to remove product");
      }
      toast.success("Product removed");
      setSelected(null);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to remove product",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total products", count: initialProducts.length },
          {
            label: "Active",
            count: initialProducts.filter((p) => p.status === "active").length,
          },
          {
            label: "Draft / archived",
            count: initialProducts.filter((p) => p.status !== "active").length,
          },
        ].map((s) => (
          <div className="admin-panel p-5" key={s.label}>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="text-2xl font-semibold mt-2">{s.count}</p>
          </div>
        ))}
      </div>
      <div className="admin-panel overflow-hidden">
        <div className="admin-toolbar p-4 flex flex-wrap gap-3 border-b">
          <Input
            aria-label="Search products"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="sm:max-w-xs"
          />
          <select
            aria-label="Product category"
            className="px-3"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {Array.from(new Set(initialProducts.map((p) => p.categoryId)))
              .filter(Boolean)
              .map((c) => (
                <option key={c}>{c}</option>
              ))}
          </select>
          <select
            aria-label="Product status"
            className="px-3"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {["active", "draft", "archived"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Product sort order"
            className="px-3"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="latest">Latest first</option>
            <option value="name">Name A–Z</option>
            <option value="price">Price low–high</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {["Product", "Category", "Price", "Status", "Actions"].map(
                  (h) => (
                    <th key={h} className="px-5 py-4">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.slice((current - 1) * 10, current * 10).map((p) => (
                <tr key={p.id}>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      {p.imagePaths?.[0] && (
                        <img
                          src={p.imagePaths[0]}
                          alt=""
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">{p.categoryId}</td>
                  <td className="p-5">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(p.basePriceMinor / 100)}
                  </td>
                  <td className="p-5 capitalize">{p.status}</td>
                  <td className="p-5">
                    <div className="flex gap-2">
                      <Link
                        className="admin-text-link py-2"
                        href={`/admin/products/${p.id}/edit`}
                      >
                        Edit
                      </Link>
                      <Button
                        variant="ghost"
                        aria-label={`Delete ${p.name}`}
                        onClick={() => setSelected(p)}
                        className="text-red-600"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    No products match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t flex justify-between items-center gap-3 text-sm">
          <span className="text-slate-500">
            {filtered.length} products · Page {current} of {pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={current >= pages}
              onClick={() => setPage(current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      {selected && (
        <div
          ref={ref}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-product-title"
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full">
            <h3 id="delete-product-title" className="font-semibold text-lg">
              Remove Product
            </h3>
            <p className="text-sm text-slate-500 mt-3 mb-6">
              Permanently remove {selected.name}? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setSelected(null)}
              >
                Cancel
              </Button>
              <Button variant="destructive" disabled={busy} onClick={remove}>
                {busy ? "Deleting..." : "Yes, remove product"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
