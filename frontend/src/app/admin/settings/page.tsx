import { requireAdmin } from "@/lib/auth/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground">Configure global store behavior and appearance.</p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Basic details about your business that appear on invoices and the storefront.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-w-md">
              <Label htmlFor="storeName">Store Name</Label>
              <Input id="storeName" defaultValue="JOJO Store" disabled />
            </div>
            <div className="space-y-2 max-w-md">
              <Label htmlFor="contactEmail">Customer Support Email</Label>
              <Input id="contactEmail" defaultValue="support@jojostore.com" disabled />
            </div>
            <div className="space-y-2 max-w-md">
              <Label htmlFor="announcement">Announcement Bar Text</Label>
              <Input id="announcement" defaultValue="Free shipping on all orders over $50!" disabled />
            </div>
            <div className="pt-2">
              <Button disabled>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order & Fulfillment Settings</CardTitle>
            <CardDescription>
              Configure default thresholds and behavior for inventory and orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-w-md">
              <Label htmlFor="lowStock">Low Stock Threshold</Label>
              <Input id="lowStock" type="number" defaultValue="5" disabled />
            </div>
            <div className="space-y-2 max-w-md">
              <Label htmlFor="reservationTime">Reservation Expiry (Minutes)</Label>
              <Input id="reservationTime" type="number" defaultValue="15" disabled />
              <p className="text-xs text-muted-foreground">
                How long inventory is reserved while a customer completes payment.
              </p>
            </div>
            <div className="pt-2">
              <Button disabled>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
