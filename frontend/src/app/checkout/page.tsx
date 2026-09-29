import { getCurrentUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { CheckoutClient } from "@/components/CheckoutClient";

export const metadata = {
  title: "Secure Checkout | JOJO Store",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  return <CheckoutClient user={user} />;
}
