import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import {
  adminProductSchema,
  productVariantOptions,
  variantKey,
} from "@/lib/admin/products";
import { adminError } from "@/lib/admin/errors";
import { randomUUID } from "crypto";
export async function PUT(
  request: Request,
  { params }: { params: { productId: string } },
) {
  try {
    await requireAdmin();
    if (!adminDb)
      return NextResponse.json(
        { error: "Product service unavailable" },
        { status: 503 },
      );
    const result = adminProductSchema.safeParse(await request.json());
    if (!result.success)
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    const product = result.data,
      options = productVariantOptions(product);
    const ref = adminDb.collection("products").doc(params.productId);
    const duplicate = await adminDb
      .collection("products")
      .where("slug", "==", product.slug)
      .get();
    if (duplicate.docs.some((doc) => doc.id !== params.productId))
      throw Error("Product slug already exists.");
    await adminDb.runTransaction(async (t) => {
      const doc = await t.get(ref);
      if (!doc.exists) throw Error("Product not found");
      const existing = await t.get(ref.collection("variants"));
      const desiredKeys = new Set(options.map(variantKey));
      for (const v of existing.docs) {
        if (
          !desiredKeys.has(
            variantKey(v.data() as { size: string; color: string }),
          ) &&
          (v.data().stockReserved || 0) > 0
        )
          throw Error(
            "A reserved size or color cannot be removed. Complete or cancel its orders first.",
          );
      }
      const replaceStock =
        product.stockQuantity !== undefined &&
        product.stockQuantity !== doc.data()?.stockQuantity;
      const writes = options.map((option) => {
        const found = existing.docs.find(
          (v) =>
            variantKey(v.data() as { size: string; color: string }) ===
            variantKey(option),
        );
        const current = found?.data();
        const quantity =
          found && !replaceStock
            ? current?.stockAvailable || 0
            : (product.stockQuantity ?? 0);
        if (quantity < (current?.stockReserved || 0))
          throw Error(
            "Stock cannot be lower than reserved quantities. Adjust inventory after fulfilling orders.",
          );
        const variantRef =
          found?.ref || ref.collection("variants").doc(randomUUID());
        return {
          ref: variantRef,
          data: {
            ...option,
            id: variantRef.id,
            productId: ref.id,
            stockAvailable: quantity,
            stockReserved: current?.stockReserved || 0,
          },
        };
      });
      t.update(ref, {
        ...product,
        currency: "INR",
        imagePaths: product.imagePaths || [],
        updatedAt: new Date(),
      });
      for (const write of writes) t.set(write.ref, write.data, { merge: true });
      for (const old of existing.docs)
        if (
          !desiredKeys.has(
            variantKey(old.data() as { size: string; color: string }),
          )
        )
          t.delete(old.ref);
    });
    revalidateTag("catalog");
    return NextResponse.json({ success: true });
  } catch (error) {
    return adminError(error);
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } },
) {
  try {
    await requireAdmin();
    if (!adminDb)
      return NextResponse.json(
        { error: "Product service unavailable" },
        { status: 503 },
      );
    const ref = adminDb.collection("products").doc(params.productId);
    await adminDb.runTransaction(async (t) => {
      const doc = await t.get(ref);
      if (!doc.exists) throw Error("Product not found");
      const variants = await t.get(ref.collection("variants"));
      if (variants.docs.some((v) => (v.data().stockReserved || 0) > 0))
        throw Error(
          "This product has reserved stock. Archive it instead until its orders are completed.",
        );
      for (const v of variants.docs) t.delete(v.ref);
      t.delete(ref);
    });
    revalidateTag("catalog");
    return NextResponse.json({ success: true });
  } catch (error) {
    return adminError(error);
  }
}
