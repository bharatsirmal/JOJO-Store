import Link from "next/link";
import { Package } from "lucide-react";
export function DashboardTables({
  recentOrders = [],
  topProducts = [],
}: {
  recentOrders?: any[];
  topProducts?: any[];
}) {
  const price = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format((amount || 0) / 100);
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="admin-panel p-6">
        <div className="flex justify-between mb-5">
          <h2 className="font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="admin-text-link text-sm">
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {!recentOrders.length && (
            <p className="text-sm text-slate-500 py-8 text-center">
              No orders yet.
            </p>
          )}
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex justify-between gap-3 py-4"
            >
              <div>
                <p className="text-sm font-medium">
                  {order.shippingAddress?.fullName ||
                    order.customerName ||
                    order.id}
                </p>
                <p className="text-xs text-slate-500 mt-1 capitalize">
                  {String(order.status || "pending").replaceAll("_", " ")}
                </p>
              </div>
              <span className="text-sm font-semibold">
                {price(order.totalMinor)}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="admin-panel p-6">
        <div className="flex justify-between mb-5">
          <h2 className="font-semibold">Latest products</h2>
          <Link href="/admin/products" className="admin-text-link text-sm">
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {!topProducts.length && (
            <p className="text-sm text-slate-500 py-8 text-center">
              No products yet.
            </p>
          )}
          {topProducts.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}/edit`}
              className="flex items-center gap-3 py-3"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-purple-50 flex items-center justify-center">
                {product.imagePaths?.[0] ? (
                  <img
                    src={product.imagePaths[0]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={20} className="text-purple-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {price(product.basePriceMinor)} · {product.status}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
