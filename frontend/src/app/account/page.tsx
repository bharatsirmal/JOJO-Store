import { getCurrentUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">My Account</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-muted-foreground">Full Name</p>
              <p>{user.displayName}</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Email Address</p>
              <p>{user.email}</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Role</p>
              <p className="capitalize">{user.role}</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Status</p>
              <p>{user.emailVerified ? "Verified" : "Unverified"}</p>
            </div>
          </div>

          <div className="pt-4 border-t flex gap-4">
            {user.role === "admin" && (
              <a href="/admin">
                <Button variant="default">Go to Admin Dashboard</Button>
              </a>
            )}
            {user.role === "delivery_partner" && (
              <a href="/delivery">
                <Button variant="default" className="bg-amber-600 hover:bg-amber-700">Go to Delivery Portal</Button>
              </a>
            )}
            <form action="/api/auth/logout" method="POST">
              <Button type="submit" variant="destructive">Logout</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}