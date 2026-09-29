import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { OrderStatus } from "@/types";

export async function PATCH(req: Request, { params }: { params: { orderId: string } }) {
  try {
    const sessionCookie = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("__session="))?.split("=")[1];
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await adminAuth!.verifySessionCookie(sessionCookie, true);
    if (decoded.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { status } = await req.json() as { status: OrderStatus };
    
    if (!status) return NextResponse.json({ error: "Status required" }, { status: 400 });

    const orderRef = adminDb!.collection("orders").doc(params.orderId);
    
    await adminDb!.runTransaction(async (t) => {
      const doc = await t.get(orderRef);
      if (!doc.exists) throw new Error("Order not found");
      
      t.update(orderRef, {
        status,
        updatedAt: new Date().toISOString()
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Order update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

