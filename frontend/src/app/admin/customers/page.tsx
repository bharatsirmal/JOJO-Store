import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import { Users, Mail, Shield, User, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CustomerActions } from "./CustomerActions";

export default async function AdminCustomersPage() {
  await requireAdmin();

  if (!adminDb) {
    return <div className="p-8">Firebase Admin not configured.</div>;
  }

  // Fetch all users from Firestore
  const snapshot = await adminDb.collection("users").get();
  
  const users = snapshot.docs.map(doc => {
    const data = doc.data();
    
    // Safely parse timestamps
    let createdAtStr = "Unknown";
    if (data.createdAt) {
      if (typeof data.createdAt === 'string') {
        createdAtStr = new Date(data.createdAt).toLocaleDateString();
      } else if (data.createdAt.toDate) {
        createdAtStr = data.createdAt.toDate().toLocaleDateString();
      }
    }

    return {
      id: doc.id,
      email: data.email || "No email",
      displayName: data.displayName || "Unknown",
      role: data.role || "customer",
      createdAt: createdAtStr,
    };
  });

  // Sort: admins first, then customers
  users.sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    return 0;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 shadow-none"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>;
      case 'delivery_partner':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 shadow-none">Delivery</Badge>;
      case 'delivery_pending':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 shadow-none">Pending Delivery</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 shadow-none"><User className="w-3 h-3 mr-1" /> Customer</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Customers & Users</h1>
          <p className="text-[15px] text-slate-500 mt-1">Manage your store's registered users, roles, and guest shoppers.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl border border-indigo-100 shadow-sm hidden sm:block">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search customers by email..." 
              className="pl-9 bg-slate-50 border-transparent focus-visible:ring-1 focus-visible:ring-[#5c5cff]"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="gap-2 text-slate-600">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No users found in database.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                          {user.displayName !== "Unknown" ? user.displayName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.displayName}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{user.id}</code>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {user.createdAt}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <CustomerActions userId={user.id} role={user.role} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
