import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server";
import { ShipmentService } from "@/lib/delivery/shipment-service";

export async function PATCH(req: Request, { params }: { params: { shipmentId: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();

    if (body.action === "mark_ready") {
      await ShipmentService.markReadyForShipping(params.shipmentId);
      return NextResponse.json({ success: true });
    }

    // Prepare for assignment in next chunk
    if (body.action === "assign" && body.partnerId) {
      await ShipmentService.assignDeliveryPartner(params.shipmentId, body.partnerId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
