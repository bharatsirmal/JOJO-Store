import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import {
  CheckoutError,
  orderSchema,
  validateCart,
  RESERVATION_MS,
} from "./checkout";
export function checkoutFailure(error: unknown) {
  if (error instanceof z.ZodError || error instanceof SyntaxError)
    return NextResponse.json(
      { error: "Check cart quantities and shipping details." },
      { status: 400 },
    );
  if (error instanceof CheckoutError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if ((error as { code?: string })?.code?.startsWith("auth/"))
    return NextResponse.json(
      { error: "Please log in again." },
      { status: 401 },
    );
  console.error("Checkout failed", error);
  return NextResponse.json(
    { error: "Checkout unavailable. Please try again." },
    { status: 500 },
  );
}
async function authenticate(req: NextRequest) {
  if (!adminAuth || !adminDb)
    throw new CheckoutError("Checkout unavailable.", 503);
  const cookie = req.cookies.get("__session")?.value;
  if (!cookie) throw new CheckoutError("Unauthorized", 401);
  return adminAuth.verifySessionCookie(cookie, true);
}
export async function quoteCheckout(req: NextRequest) {
  try {
    await authenticate(req);
    const { items } = await req.json();
    const { reservations, ...quote } = await validateCart(
      adminDb!,
      items,
      (ref) => ref.get(),
    );
    return NextResponse.json({
      ...quote,
      expiresAt: new Date(Date.now() + RESERVATION_MS).toISOString(),
    });
  } catch (error) {
    return checkoutFailure(error);
  }
}
export async function createOrder(req: NextRequest) {
  try {
    const user = await authenticate(req),
      body = orderSchema.parse(await req.json()),
      db = adminDb!;
    const result = await db.runTransaction(async (t) => {
      const ref = db.collection("orders").doc(body.idempotencyKey),
        existing = await t.get(ref);
      if (existing.exists) {
        if (existing.data()?.customerId !== user.uid)
          throw new CheckoutError("Forbidden", 403);
        return {
          success: true,
          orderId: ref.id,
          status: existing.data()?.status,
        };
      }
      const { reservations, ...validated } = await validateCart(
        db,
        body.items,
        (ref) => t.get(ref),
      );
      const now = new Date().toISOString();
      const order = {
        ...validated,
        id: ref.id,
        customerId: user.uid,
        shippingAddress: body.shippingAddress,
        status: "pending_payment",
        reservationExpiresAt: new Date(
          Date.now() + RESERVATION_MS,
        ).toISOString(),
        createdAt: now,
        updatedAt: now,
      };
      for (const reservation of reservations)
        t.update(reservation.ref, { stockReserved: reservation.reserved });
      t.set(ref, order);
      return { success: true, orderId: ref.id, order };
    });
    return NextResponse.json(result);
  } catch (error) {
    return checkoutFailure(error);
  }
}
