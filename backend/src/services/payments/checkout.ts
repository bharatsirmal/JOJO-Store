import { z } from "zod";
import type { OrderItem } from "@/types";

export const CHECKOUT_CURRENCY = "inr";
export const SHIPPING_MINOR = 1500;
export const RESERVATION_MS = 15 * 60 * 1000;
const identifier = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[A-Za-z0-9_-]+$/);
const cartSchema = z
  .array(
    z.object({
      productId: identifier,
      variantId: identifier,
      quantity: z.number().int().min(1).max(99),
    }),
  )
  .min(1)
  .max(50);
export const orderSchema = z.object({
  items: cartSchema,
  idempotencyKey: identifier,
  shippingAddress: z.object({
    fullName: z.string().trim().min(2).max(100),
    email: z.string().email().optional(),
    phone: z.string().trim().min(7).max(30),
    addressLine1: z.string().trim().min(1).max(200),
    addressLine2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(1).max(100),
    stateOrProvince: z.string().trim().max(100).optional(),
    postalCode: z.string().trim().min(1).max(20),
    countryCode: z
      .string()
      .length(2)
      .transform((v) => v.toUpperCase()),
    isDefault: z.boolean().default(false),
  }),
});
export class CheckoutError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function normalizeCart(value: unknown) {
  const items = cartSchema.parse(value),
    map = new Map<string, (typeof items)[number]>();
  for (const item of items) {
    const key = `${item.productId}/${item.variantId}`;
    const quantity = (map.get(key)?.quantity || 0) + item.quantity;
    if (quantity > 99)
      throw new CheckoutError("Maximum quantity per variant is 99.");
    map.set(key, { ...item, quantity });
  }
  return [...map.values()];
}
export function checkoutTotals(subtotalMinor: number) {
  if (!Number.isSafeInteger(subtotalMinor) || subtotalMinor < 0)
    throw new CheckoutError("Invalid product pricing.");
  const taxMinor = Math.round(subtotalMinor * 0.08);
  const totalMinor = subtotalMinor + SHIPPING_MINOR + taxMinor;
  if (!Number.isSafeInteger(totalMinor))
    throw new CheckoutError("Order amount is too large.");
  return {
    subtotalMinor,
    discountMinor: 0,
    shippingMinor: SHIPPING_MINOR,
    taxMinor,
    totalMinor,
    currency: CHECKOUT_CURRENCY,
  };
}
export async function validateCart(
  db: FirebaseFirestore.Firestore,
  value: unknown,
  get: (
    ref: FirebaseFirestore.DocumentReference,
  ) => Promise<FirebaseFirestore.DocumentSnapshot>,
) {
  const items = normalizeCart(value),
    validated: OrderItem[] = [],
    reservations: {
      ref: FirebaseFirestore.DocumentReference;
      reserved: number;
    }[] = [];
  let subtotalMinor = 0;
  for (const item of items) {
    const productRef = db.collection("products").doc(item.productId),
      variantRef = productRef.collection("variants").doc(item.variantId);
    const productDoc = await get(productRef),
      variantDoc = await get(variantRef);
    if (!productDoc.exists || !variantDoc.exists)
      throw new CheckoutError("A cart item no longer exists.", 409);
    const product = productDoc.data()!,
      variant = variantDoc.data()!;
    if (product.status !== "active")
      throw new CheckoutError("A cart item is no longer available.", 409);
    const available = variant.stockAvailable ?? 0,
      reserved = variant.stockReserved ?? 0;
    if (
      !Number.isSafeInteger(available) ||
      !Number.isSafeInteger(reserved) ||
      reserved < 0 ||
      available - reserved < item.quantity
    )
      throw new CheckoutError(`Insufficient stock for ${product.name}.`, 409);
    const price = variant.priceMinor ?? product.basePriceMinor;
    if (!Number.isSafeInteger(price) || price < 0)
      throw new CheckoutError("Invalid product pricing.");
    subtotalMinor += price * item.quantity;
    validated.push({
      ...item,
      productName: product.name,
      sku: variant.sku || "",
      size: variant.size || "",
      color: variant.color || "",
      unitPriceMinor: price,
      ...(product.imagePaths?.[0] ? { imagePath: product.imagePaths[0] } : {}),
    });
    reservations.push({ ref: variantRef, reserved: reserved + item.quantity });
  }
  return { items: validated, reservations, ...checkoutTotals(subtotalMinor) };
}
