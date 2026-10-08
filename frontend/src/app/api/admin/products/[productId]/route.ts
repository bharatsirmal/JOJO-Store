import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import * as z from "zod";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  categoryId: z.string().min(2),
  subCategory: z.string().optional(),
  basePriceMinor: z.number().int().min(0),
  status: z.enum(["active", "draft", "archived"]),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  featured: z.boolean().default(false),
  isComfortSection: z.boolean().default(false),
  sku: z.string().optional(),
  stockQuantity: z.number().optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  colorVariants: z.array(z.object({
    colorName: z.string(),
    imagePaths: z.array(z.string())
  })).optional(),
  imagePaths: z.array(z.string()).optional(),
  shippingReturns: z.string().optional(),
  isNew: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  offerPriceMinor: z.number().int().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    await requireAdmin();

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const docRef = adminDb.collection("products").doc(params.productId);
    
    await adminDb.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      if (!doc.exists) {
        throw new Error("Product not found");
      }
      
      const updateData = {
        ...validatedData,
        imagePaths: validatedData.imagePaths || [],
        updatedAt: new Date(),
      };

      t.update(docRef, updateData);
    });

    revalidateTag("catalog");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating product:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Product not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    await requireAdmin();

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 });
    }

    const docRef = adminDb.collection("products").doc(params.productId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    await docRef.delete();
    revalidateTag("catalog");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
