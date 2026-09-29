import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  if (!adminDb) {
    return <div className="p-8">Firebase Admin not configured.</div>;
  }

  // Fetch verified sales (orders that are confirmed, shipped, or delivered)
  const snapshot = await adminDb.collection("orders").get();
  
  const salesData: { date: string; revenue: number; orders: number }[] = [];
  const dateMap = new Map<string, { revenue: number; orders: number }>();

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.status === "confirmed" || data.status === "shipped" || data.status === "delivered") {
      // Group by day (YYYY-MM-DD)
      const dateStr = new Date(data.createdAt).toISOString().split('T')[0];
      const revenueMajor = (data.totalMinor || 0) / 100;
      
      if (dateMap.has(dateStr)) {
        const existing = dateMap.get(dateStr)!;
        dateMap.set(dateStr, { revenue: existing.revenue + revenueMajor, orders: existing.orders + 1 });
      } else {
        dateMap.set(dateStr, { revenue: revenueMajor, orders: 1 });
      }
    }
  });

  // Sort by date ascending
  const sortedDates = Array.from(dateMap.keys()).sort();
  for (const d of sortedDates) {
    salesData.push({ date: d, ...dateMap.get(d)! });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Interactive sales reports and store metrics.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sales Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {salesData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No verified sales data yet.
            </div>
          ) : (
            <AnalyticsCharts data={salesData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}