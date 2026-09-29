import { getCurrentUser } from "@/lib/auth/server";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  
  if (!user || (user.role !== "admin" && user.role !== "delivery_partner")) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <AdminHeader userEmail={user.email || "User"} userName={user.displayName || "Delivery Profile"} userRole={user.role} />
      <main className="flex-1 p-4 md:p-8 bg-muted/20">{children}</main>
    </div>
  );
}
