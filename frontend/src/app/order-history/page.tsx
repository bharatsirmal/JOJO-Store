import { getCurrentUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { MyOrders } from "@/components/MyOrders";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order History | JOJO Store" };

export default async function OrderHistoryPage() {
  if (!(await getCurrentUser())) redirect("/login");
  return <MyOrders view="history" />;
}
