import { adminDb } from "@/lib/backend/db";
import { requireAdmin } from "@/lib/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { salesMetrics } from "@/lib/admin/metrics";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  if (!adminDb) {
    return <div className="p-8">Firebase Admin not configured.</div>;
  }

  const snapshot = await adminDb
    .collection("orders")
    .select("status", "totalMinor", "createdAt")
    .get();
  const { salesData } = salesMetrics(snapshot.docs.map((doc) => doc.data()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Interactive sales reports and store metrics.
        </p>
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
