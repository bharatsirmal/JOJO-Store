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

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Enforce slug uniqueness using a transaction
    const productsRef = adminDb.collection("products");
    
    // Quick check to see if slug exists
    const slugQuery = await productsRef.where("slug", "==", validatedData.slug).limit(1).get();
    if (!slugQuery.empty) {
      return NextResponse.json({ error: "Product slug already exists. Please choose a unique slug." }, { status: 400 });
    }

    // In a highly concurrent environment, this should ideally use a transaction or unique constraints 
    // (Firestore doesn't have unique constraints natively, so we usually use the slug as the document ID 
    // or a separate registry, but querying is sufficient for Phase 6 requirements if acceptable).
    // The prompt says "concurrency-safe mechanism". 
    // Let's use the slug as the document ID for the product to guarantee absolute uniqueness atomically.
    
    const docRef = productsRef.doc(validatedData.slug);
    
    await adminDb.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      if (doc.exists) {
        throw new Error("Product slug already exists.");
      }
      
      const newProductData = {
        ...validatedData,
        imagePaths: validatedData.imagePaths || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid,
      };

      t.set(docRef, newProductData);

      // Generate variant subcollection based on sizes and colors
      if (validatedData.colorVariants && validatedData.sizes) {
        let variantIndex = 1;
        for (const cv of validatedData.colorVariants) {
          for (const size of validatedData.sizes) {
            const variantId = `${validatedData.slug}-${variantIndex}`;
            const variantRef = docRef.collection("variants").doc(variantId);
            
            t.set(variantRef, {
              id: variantId,
              productId: validatedData.slug,
              sku: `${validatedData.slug}-${size}-${cv.colorName}`.toUpperCase().replace(/\s+/g, "-"),
              size: size,
              color: cv.colorName,
              priceMinor: validatedData.basePriceMinor,
              stockAvailable: 100, // Default stock for dev
              stockReserved: 0
            });
            variantIndex++;
          }
        }
      } else {
        // Create a default variant if no explicit sizes/colors
        const variantId = `${validatedData.slug}-default`;
        const variantRef = docRef.collection("variants").doc(variantId);
        t.set(variantRef, {
          id: variantId,
          productId: validatedData.slug,
          sku: `${validatedData.slug}-DEFAULT`.toUpperCase(),
          size: "Default",
          color: "Default",
          priceMinor: validatedData.basePriceMinor,
          stockAvailable: 100,
          stockReserved: 0
        });
      }
    });

    revalidateTag("catalog");
    return NextResponse.json({ success: true, slug: validatedData.slug }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }
    
    if (error instanceof Error && error.message === "Product slug already exists.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
