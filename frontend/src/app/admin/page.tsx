
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";

export default async function AdminDashboard() {
  await requireAdmin();

  if (!adminDb) {
    return <div className="p-8 text-red-500">Firebase Admin is not configured.</div>;
  }

  // Fetch metrics
  const allOrdersSnap = await adminDb.collection("orders").get();
  const productsSnap = await adminDb.collection("products").count().get();
  const usersSnap = await adminDb.collection("users").count().get();

  let totalRevenueMinor = 0;
  const totalOrders = allOrdersSnap.size;
  let confirmedOrders = 0;

  allOrdersSnap.forEach((doc) => {
    const data = doc.data();
    if (data.status === "confirmed" || data.status === "shipped" || data.status === "delivered" || data.status === "paid" || data.status === "processing") {
      confirmedOrders++;
      totalRevenueMinor += data.totalMinor || 0;
    }
  });

  const activeProductsCount = productsSnap.data().count;
  const customersCount = usersSnap.data().count;

  const totalRevenueFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalRevenueMinor / 100);

  // For tables
  const recentOrdersSnap = await adminDb.collection("orders").orderBy("createdAt", "desc").limit(5).get();
  const recentProductsSnap = await adminDb.collection("products").orderBy("createdAt", "desc").limit(5).get();
  
  // Serialize complex Firestore objects (like Timestamps) to plain values (strings)
  const serializeDoc = (doc: any) => {
    const data = doc.data();
    const serialized: any = { id: doc.id };
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof (value as any).toDate === 'function') {
        serialized[key] = (value as any).toDate().toISOString();
      } else {
        serialized[key] = value;
      }
    }
    return serialized;
  };

  const recentOrders = recentOrdersSnap.docs.map(serializeDoc);
  const topProducts = recentProductsSnap.docs.map(serializeDoc);

  return <DashboardOverview totalRevenueFormatted={totalRevenueFormatted} totalOrders={totalOrders} activeProductsCount={activeProductsCount} customersCount={customersCount} recentOrders={recentOrders} topProducts={topProducts} />;
}
