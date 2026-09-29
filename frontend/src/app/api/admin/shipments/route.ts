import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server";
import { ShipmentService } from "@/lib/delivery/shipment-service";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();

    if (body.action === "create" && body.orderId) {
      const shipment = await ShipmentService.createFulfillmentTask(body.orderId);
      return NextResponse.json({ success: true, shipment });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
