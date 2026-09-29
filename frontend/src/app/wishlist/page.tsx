import { getCurrentUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function WishlistPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-8">My Wishlist</h1>
      
      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-24 bg-muted rounded-xl border border-dashed text-center px-4">
        <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-6">Save items you love to review them later.</p>
        <Link href="/products">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
