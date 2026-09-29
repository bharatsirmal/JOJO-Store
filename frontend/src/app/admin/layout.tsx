import { requireAdmin } from "@/lib/auth/server";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <AdminShell userEmail={user.email || "Admin"} userName={user.displayName || "Admin User"} userRole={user.role} userImage={user.photoURL}>
      {children}
    </AdminShell>
  );
}
