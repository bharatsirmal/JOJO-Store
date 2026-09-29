import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import * as z from "zod";

const inventoryAdjustmentSchema = z.object({
  variantId: z.string(),
  adjustmentAmount: z.number().int(),
  reason: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { variantId, adjustmentAmount, reason } = inventoryAdjustmentSchema.parse(body);

    if (adjustmentAmount === 0) {
      return NextResponse.json({ error: "Adjustment amount cannot be 0" }, { status: 400 });
    }

    const variantRef = adminDb.collection("variants").doc(variantId);
    const auditLogRef = adminDb.collection("inventory_audit").doc();

    let newStockAvailable = 0;

    await adminDb.runTransaction(async (t) => {
      const doc = await t.get(variantRef);
      if (!doc.exists) {
        throw new Error("Variant not found");
      }

      const currentData = doc.data()!;
      const currentAvailable = currentData.stockAvailable || 0;
      newStockAvailable = currentAvailable + adjustmentAmount;

      if (newStockAvailable < 0) {
        throw new Error("Cannot reduce physical stock below active reservations (Available stock would be negative).");
      }

      t.update(variantRef, {
        stockAvailable: newStockAvailable,
        updatedAt: new Date(),
      });

      // Step 6.18 - Audit Logging
      t.set(auditLogRef, {
        variantId,
        previousQuantity: currentAvailable,
        newQuantity: newStockAvailable,
        adjustmentAmount,
        reason,
        adminUid: user.uid,
        timestamp: new Date(),
        actionType: "inventory_adjustment"
      });
    });

    return NextResponse.json({ success: true, newStockAvailable });
  } catch (error: unknown) {
    console.error("Inventory adjustment error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const msg = error instanceof Error ? error.message : "Internal Server Error";
    
    if (msg.includes("Cannot reduce physical stock")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    if (msg === "Variant not found") {
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
