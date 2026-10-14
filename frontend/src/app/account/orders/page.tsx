import { getCurrentUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { MyOrders } from "@/components/MyOrders";
export const dynamic = "force-dynamic";
export const metadata = { title: "My Orders | JOJO Store" };
export default async function OrdersPage() {
  if (!(await getCurrentUser())) redirect("/login");
  return <MyOrders />;
}
