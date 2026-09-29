
const fs = require("fs");
const path = "src/app/admin/customers/[userId]/page.tsx";

const content = `import { requireAdmin } from "@/lib/auth/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Shield, User, Package, Calendar } from "lucide-react";
import Link from "next/link";
import { CustomerProfileActions } from "./CustomerProfileActions";

const formatPrice = (minor: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(minor / 100);

export default async function CustomerProfilePage({ params }: { params: { userId: string } }) {
  await requireAdmin();

  if (!adminDb || !adminAuth) return null;

  const userDoc = await adminDb.collection("users").doc(params.userId).get();
  if (!userDoc.exists) {
    notFound();
  }

  const userData = userDoc.data()!;
  
  let userRecord = null;
  try {
    userRecord = await adminAuth.getUser(params.userId);
  } catch (e) {
    console.warn("User exists in Firestore but missing in Auth:", params.userId);
  }
  
  let displayName = userData.displayName || userRecord?.displayName;
  if (!displayName || displayName === "Unknown") {
    const email = userData.email || userRecord?.email || "";
    displayName = email ? email.split("@")[0] : "Unknown";
  }
  
  let joinedDate = "Unknown";
  if (userRecord?.metadata?.creationTime) {
    joinedDate = new Date(userRecord.metadata.creationTime).toLocaleDateString();
  } else if (userData.createdAt) {
    joinedDate = typeof userData.createdAt === "string" 
      ? new Date(userData.createdAt).toLocaleDateString() 
      : (userData.createdAt.toDate ? userData.createdAt.toDate().toLocaleDateString() : "Unknown");
  }

  // Fetch order history
  const ordersSnap = await adminDb.collection("orders")
    .where("customerId", "==", params.userId)
    .get();
    
  const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Sort in memory to avoid requiring a composite index
  orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>;
      case "delivery_partner": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Delivery</Badge>;
      case "delivery_pending": return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Pending Delivery</Badge>;
      default: return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><User className="w-3 h-3 mr-1" /> Customer</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/customers" className="text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Profile</h1>
          <p className="text-slate-500 text-sm mt-1">ID: {params.userId}</p>
        </div>
        
        <CustomerProfileActions userId={params.userId} email={userData.email || ""} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 text-2xl font-bold">
                  {displayName !== "Unknown" ? displayName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                </div>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Name</p>
                <p className="font-medium text-slate-900">{displayName}</p>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Email</p>
                <div className="flex items-center gap-2 text-slate-900">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{userData.email || "No email"}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Role</p>
                <div className="mt-1">{getRoleBadge(userData.role || "customer")}</div>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Joined Date</p>
                <div className="flex items-center gap-2 text-slate-900">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{joinedDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order History ({orders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  This user has not placed any orders yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.map((order: any) => (
                    <div key={order.id} className="py-4 flex items-center justify-between">
                      <div>
                        <Link href={\`/admin/orders/\${order.id}\`} className="font-medium text-indigo-600 hover:underline">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </Link>
                        <p className="text-sm text-slate-500 mt-1">
                          {new Date(order.createdAt || 0).toLocaleDateString()} • {order.items?.length || 0} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatPrice(order.totalMinor || 0)}</p>
                        <Badge variant="outline" className="mt-1 capitalize">{order.status || "Unknown"}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path, content, "utf8");

