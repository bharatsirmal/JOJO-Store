import { adminDb } from "@/lib/firebase/admin";
import { CatalogProduct, ProductVariant } from "@/types";
import { unstable_cache } from "next/cache";

/**
 * Fetches published products for public catalog viewing.
 * Prevents exposing draft or archived items.
 */
type CatalogOptions = {
  searchQuery?: string;
  categoryId?: string;
  featured?: boolean;
  limit?: number;
};

export async function getPublishedProducts(options?: CatalogOptions): Promise<CatalogProduct[]> {
  if (!adminDb) return [];
  try {
    return await getCachedPublishedProducts(options);
  } catch (error) {
    console.error("Error fetching published products:", error);
    return [];
  }
}

// Cache successful public reads only; failed database calls must remain retryable.
const getCachedPublishedProducts = unstable_cache(async (options?: CatalogOptions): Promise<CatalogProduct[]> => {
  if (!adminDb) throw new Error("Firebase Admin not configured");

    let query: FirebaseFirestore.Query = adminDb.collection("products").where("status", "==", "active");

    if (options?.categoryId) {
      query = query.where("categoryId", "==", options.categoryId);
    }
    if (options?.featured !== undefined) {
      query = query.where("featured", "==", options.featured);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    
    let results = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        categoryId: data.categoryId,
        imagePaths: data.imagePaths || [],
        basePriceMinor: data.basePriceMinor,
        currency: data.currency || "USD",
        featured: !!data.featured,
        status: data.status,
        sizes: data.sizes || [],
        colors: data.colors || [],
        colorVariants: data.colorVariants || [],
        isNew: !!data.isNew,
        isBestseller: !!data.isBestseller,
        offerPriceMinor: data.offerPriceMinor,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as CatalogProduct;
    });

    if (options?.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      results = results.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    return results;
}, ["published-products"], { revalidate: 60, tags: ["catalog"] });

export async function getProductBySlug(slug: string): Promise<{ product: CatalogProduct, variants: ProductVariant[] } | null> {
  if (!adminDb) return null;

  try {
    const snapshot = await adminDb.collection("products")
      .where("slug", "==", slug)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();
    
    const product: CatalogProduct = {
      id: doc.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      categoryId: data.categoryId,
      imagePaths: data.imagePaths || [],
      basePriceMinor: data.basePriceMinor,
      currency: data.currency || "USD",
      featured: !!data.featured,
      status: data.status,
      sizes: data.sizes || [],
      colors: data.colors || [],
      colorVariants: data.colorVariants || [],
      material: data.material,
      careInstructions: data.careInstructions,
      shippingReturns: data.shippingReturns,
      isNew: !!data.isNew,
      isBestseller: !!data.isBestseller,
      offerPriceMinor: data.offerPriceMinor,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };

    const variantsSnapshot = await adminDb.collection(`products/${doc.id}/variants`).get();
    const variants: ProductVariant[] = variantsSnapshot.docs.map(vDoc => {
      const vData = vDoc.data();
      return {
        id: vDoc.id,
        productId: doc.id,
        sku: vData.sku,
        size: vData.size,
        color: vData.color,
        priceMinor: vData.priceMinor || product.basePriceMinor,
        stockAvailable: vData.stockAvailable || 0,
        stockReserved: vData.stockReserved || 0,
      } as ProductVariant;
    });

    return { product, variants };
  } catch (error) {
    console.error(`Error fetching product by slug ${slug}:`, error);
    return null;
  }
}

