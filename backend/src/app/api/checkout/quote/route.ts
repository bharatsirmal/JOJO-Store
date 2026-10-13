import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { CheckoutQuote, OrderItem } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Firebase Admin is not configured" }, { status: 500 });
    }

    await adminAuth.verifySessionCookie(sessionCookie, true);
    
    const body = await req.json();
    const cartItems = body.items || [];
    
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    let subtotalMinor = 0;
    const validatedItems: OrderItem[] = [];

    // In a real production app, we would query these efficiently, perhaps caching.
    // For Phase 4, we read each product to validate pricing authoritatively.
    for (const item of cartItems) {
      const { productId, variantId, quantity } = item;
      
      const productDoc = await adminDb.collection("products").doc(productId).get();
      if (!productDoc.exists) { console.log("Product not found:", productId); continue; }
      
      const productData = productDoc.data()!;
      if (productData.status !== "active") { console.log("Product not active:", productId); continue; }
      
      const variantDoc = await adminDb.collection(`products/${productId}/variants`).doc(variantId).get();
      if (!variantDoc.exists) { console.log("Variant not found:", variantId); continue; }
      
      const variantData = variantDoc.data()!;
      const available = (variantData.stockAvailable || 0) - (variantData.stockReserved || 0);
      
      if (available < quantity) {
        return NextResponse.json({ 
          error: "Insufficient stock", 
          productId, 
          variantId,
          available 
        }, { status: 409 });
      }

      const unitPriceMinor = variantData.priceMinor || productData.basePriceMinor;
      subtotalMinor += unitPriceMinor * quantity;
      
      validatedItems.push({
        productId,
        productName: productData.name,
        variantId,
        sku: variantData.sku,
        size: variantData.size,
        color: variantData.color,
        quantity,
        unitPriceMinor,
        imagePath: productData.imagePaths?.[0]
      });
    }

    if (validatedItems.length === 0) {
      return NextResponse.json({ error: "No valid items in cart" }, { status: 400 });
    }

    // Phase 4 Stub: Flat $10 shipping, 8% tax calculation
    const shippingMinor = 1000;
    const taxMinor = Math.round(subtotalMinor * 0.08);
    const totalMinor = subtotalMinor + shippingMinor + taxMinor;

    const quote: CheckoutQuote = {
      items: validatedItems,
      subtotalMinor,
      discountMinor: 0,
      shippingMinor,
      taxMinor,
      totalMinor,
      currency: "USD",
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString() // 15 min expiry
    };

    return NextResponse.json(quote);

  } catch (error) {
    console.error("Error generating checkout quote:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
