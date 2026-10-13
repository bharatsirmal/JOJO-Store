import Link from "next/link";
import { adminDb } from "@/lib/backend/db";
import { requireAdmin } from "@/lib/auth/server";
export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  await requireAdmin();
  if (!adminDb) return <p>Firebase Admin not configured.</p>;
  const snapshot = await adminDb
    .collection("products")
    .select("categoryId", "status")
    .get();
  const categories = new Map<string, { count: number; active: number }>();
  snapshot.forEach((doc) => {
    const p = doc.data();
    if (!p.categoryId) return;
    const c = categories.get(p.categoryId) || { count: 0, active: 0 };
    c.count++;
    if (p.status === "active") c.active++;
    categories.set(p.categoryId, c);
  });
  const rows = Array.from(categories.entries())
    .filter(([name]) =>
      name.toLowerCase().includes((searchParams.q || "").toLowerCase()),
    )
    .sort(([a], [b]) => a.localeCompare(b));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold">Categories</h1>
        <p className="text-sm text-slate-500 mt-2">
          Categories come from your products. Assign or change a category when
          editing a product.
        </p>
      </div>
      <section className="admin-panel overflow-hidden">
        <form className="admin-toolbar p-4 border-b flex gap-3" method="get">
          <input
            name="q"
            aria-label="Search categories"
            placeholder="Search categories..."
            defaultValue={searchParams.q}
            className="px-4 w-full max-w-sm"
          />
          <button className="admin-primary-action" type="submit">
            Search
          </button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr>
                {[
                  "Category",
                  "Total products",
                  "Active products",
                  "Actions",
                ].map((h) => (
                  <th className="p-5" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map(([name, c]) => (
                <tr key={name}>
                  <td className="p-5 font-semibold">{name}</td>
                  <td className="p-5">{c.count}</td>
                  <td className="p-5">{c.active}</td>
                  <td className="p-5">
                    <Link
                      className="admin-text-link"
                      href={`/admin/products?category=${encodeURIComponent(name)}`}
                    >
                      View products
                    </Link>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td className="p-12 text-center text-slate-500" colSpan={4}>
                    No categories found. Add a category to a product to get
                    started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
