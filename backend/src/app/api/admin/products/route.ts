import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminDb } from "@/config/firebase";
import { requireAdmin } from "@/services/auth";
import {
  adminProductSchema,
  productVariantOptions,
} from "@/services/admin/products";
import { adminError } from "@/services/admin/errors";
export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
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
    const product = result.data;
    const duplicate = await adminDb
      .collection("products")
      .where("slug", "==", product.slug)
      .limit(1)
      .get();
    if (!duplicate.empty) throw Error("Product slug already exists.");
    const options = productVariantOptions(product),
      ref = adminDb.collection("products").doc(product.slug);
    await adminDb.runTransaction(async (t) => {
      const doc = await t.get(ref);
      if (doc.exists) throw Error("Product slug already exists.");
      t.set(ref, {
        ...product,
        currency: "INR",
        imagePaths: product.imagePaths || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid,
      });
      options.forEach((variant, index) => {
        const id = `${product.slug}-${index + 1}`;
        t.set(ref.collection("variants").doc(id), {
          ...variant,
          id,
          productId: ref.id,
          stockAvailable: product.stockQuantity ?? 0,
          stockReserved: 0,
        });
      });
    });
    revalidateTag("catalog");
    return NextResponse.json(
      { success: true, slug: product.slug },
      { status: 201 },
    );
  } catch (error) {
    return adminError(error);
  }
}
