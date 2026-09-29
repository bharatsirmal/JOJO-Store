import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Order, OrderItem } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Firebase Admin is not configured" }, { status: 500 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    const body = await req.json();
    const { items, idempotencyKey } = body;

    if (!items || !idempotencyKey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Atomic stock reservation and pending order creation
    const result = await adminDb.runTransaction(async (transaction) => {
      // Use ! operator safely since we proved it isn't null at top of file
      const db = adminDb!; 
      const orderRef = db.collection("orders").doc(idempotencyKey);
      
      // 1. Check if order already exists (Idempotency)
      const existingOrder = await transaction.get(orderRef);
      if (existingOrder.exists) {
        return { success: true, orderId: idempotencyKey, status: existingOrder.data()?.status };
      }

      let subtotalMinor = 0;
      const validatedItems: OrderItem[] = [];
      const variantRefs = [];

      // 2. Validate all items and prep variant refs
      for (const item of items) {
        const productRef = db.collection("products").doc(item.productId);
        const variantRef = productRef.collection("variants").doc(item.variantId);
        
        const productSnap = await transaction.get(productRef);
        const variantSnap = await transaction.get(variantRef);
        
        if (!productSnap.exists || !variantSnap.exists) {
          throw new Error(`Item ${item.productId} not found`);
        }

        const product = productSnap.data()!;
        const variant = variantSnap.data()!;

        // Check stock (available - reserved)
        const available = variant.stockAvailable || 0;
        const reserved = variant.stockReserved || 0;
        
        if (available - reserved < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name} (${variant.size} ${variant.color})`);
        }

        const priceMinor = variant.priceMinor;
        subtotalMinor += priceMinor * item.quantity;
        
        validatedItems.push({
          productId: item.productId,
          productName: product.name,
          variantId: item.variantId,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          quantity: item.quantity,
          unitPriceMinor: priceMinor,
          imagePath: product.imagePaths?.[0]
        });

        // Track new reservation count
        variantRefs.push({
          ref: variantRef,
          reserved: reserved + item.quantity
        });
      }

      // Hardcoded for now (would typically be rules engine)
      const shippingMinor = 1500; 
      const taxMinor = Math.round(subtotalMinor * 0.08); // 8%
      const totalMinor = subtotalMinor + shippingMinor + taxMinor;
      
      const now = new Date();
      // Reservation expires in 15 minutes
      const expiresAt = new Date(now.getTime() + 15 * 60000); 

      const newOrder: Omit<Order, "id"> = {
        customerId: decoded.uid,
        items: validatedItems,
        shippingAddress: body.shippingAddress,
        subtotalMinor,
        discountMinor: 0,
        shippingMinor,
        taxMinor,
        totalMinor,
        currency: "usd",
        status: "pending_payment",
        reservationExpiresAt: expiresAt.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      // 3. Write updates
      for (const vRef of variantRefs) {
        transaction.update(vRef.ref, { stockReserved: vRef.reserved });
      }
      
      transaction.set(orderRef, newOrder);

      return { success: true, orderId: idempotencyKey, order: newOrder };
    });

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error("Order creation transaction failed:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to create order" }, { status: 500 });
  }
}
