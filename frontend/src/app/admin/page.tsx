import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { adminDb } from "@/lib/backend/db";
import { requireAdmin } from "@/lib/auth/server";
import { salesMetrics, adminDate } from "@/lib/admin/metrics";
export default async function AdminDashboard() {
  await requireAdmin();
  if (!adminDb) return <p>Firebase Admin is not configured.</p>;
  const [orders, products, customers, recentOrders, recentProducts] =
    await Promise.all([
      adminDb
        .collection("orders")
        .select("status", "totalMinor", "createdAt")
        .get(),
      adminDb
        .collection("products")
        .where("status", "==", "active")
        .count()
        .get(),
      adminDb.collection("users").where("role", "==", "customer").count().get(),
      adminDb.collection("orders").orderBy("createdAt", "desc").limit(5).get(),
      adminDb
        .collection("products")
        .orderBy("createdAt", "desc")
        .limit(5)
        .get(),
    ]);
  const metrics = salesMetrics(orders.docs.map((doc) => doc.data()));
  const serialize = (doc: any) =>
    JSON.parse(
      JSON.stringify({
        id: doc.id,
        ...doc.data(),
        createdAt: adminDate(doc.data().createdAt)?.toISOString(),
        updatedAt: adminDate(doc.data().updatedAt)?.toISOString(),
      }),
    );
  return (
    <DashboardOverview
      totalRevenueFormatted={new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(metrics.revenueMinor / 100)}
      totalOrders={orders.size}
      activeProductsCount={products.data().count}
      customersCount={customers.data().count}
      salesData={metrics.salesData}
      recentOrders={recentOrders.docs.map(serialize)}
      topProducts={recentProducts.docs.map(serialize)}
    />
  );
}
