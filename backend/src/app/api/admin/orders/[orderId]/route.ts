import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import { adminError } from "@/lib/admin/errors";
export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } },
) {
  try {
    await requireAdmin();
    if (!adminDb)
      return NextResponse.json(
        { error: "Order service unavailable" },
        { status: 503 },
      );
    const { status } = await request.json();
    if (!["payment_processing", "confirmed", "cancelled"].includes(status))
      throw Error("Choose a supported order action.");
    const ref = adminDb.collection("orders").doc(params.orderId);
    await adminDb.runTransaction(async (t) => {
      const doc = await t.get(ref);
      if (!doc.exists) throw Error("Order not found");
      const order = doc.data()!;
      if (order.paymentReviewRequired && status !== "cancelled") throw Error("Check this payment in Stripe before fulfilling the order.");
      if (order.status === status) return;
      const allowed: Record<string, string[]> = {
        pending_payment: ["payment_processing", "cancelled"],
        payment_processing: ["confirmed", "cancelled"],
      };
      if (!allowed[order.status]?.includes(status))
        throw Error(
          `Cannot change ${order.status} to ${status}. Refresh the order and try again.`,
        );
      const variants = [];
      if (status === "confirmed" || status === "cancelled")
        for (const item of order.items || []) {
          const variantRef = adminDb!
            .collection("products")
            .doc(item.productId)
            .collection("variants")
            .doc(item.variantId);
          const variant = await t.get(variantRef);
          if (!variant.exists) {
            if (status === "confirmed")
              throw Error("Order inventory not found");
            continue;
          }
          const data = variant.data()!;
          if (status === "confirmed" && data.stockAvailable < item.quantity)
            throw Error("Not enough physical stock to confirm this order.");
          variants.push({ ref: variantRef, quantity: item.quantity, data });
        }
      for (const v of variants)
        t.update(v.ref, {
          stockReserved: Math.max(0, (v.data.stockReserved || 0) - v.quantity),
          ...(status === "confirmed"
            ? { stockAvailable: v.data.stockAvailable - v.quantity }
            : {}),
          updatedAt: new Date().toISOString(),
        });
      t.update(ref, { status, ...(status === "confirmed" ? {inventoryFinalizedAt:new Date().toISOString()} : {}), updatedAt: new Date().toISOString() });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return adminError(error);
  }
}
