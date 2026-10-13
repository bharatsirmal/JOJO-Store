import { adminDb } from "@/lib/backend/db";
import { requireAdmin } from "@/lib/auth/server";
import { ProductVariant, CatalogProduct } from "@/types";
import { InventoryTable } from "@/components/admin/InventoryTable";

export default async function AdminInventoryPage() {
  await requireAdmin();

  if (!adminDb) {
    return <div className="p-8">Firebase Admin not configured.</div>;
  }

  // In a massive catalog we would use pagination. For Phase 6 requirements, a simple fetch is fine.
  const variantsSnap = await adminDb.collectionGroup("variants").get();
  const productsSnap = await adminDb.collection("products").get();

  const productMap = new Map<string, CatalogProduct>();
  productsSnap.forEach((doc) => {
    productMap.set(doc.id, { id: doc.id, ...doc.data() } as CatalogProduct);
  });

  const variants = variantsSnap.docs
    .map((doc) => {
      const data = doc.data() as Omit<ProductVariant, "id">;
      const productId = data.productId || doc.ref.parent.parent?.id || "";
      const productName = productMap.get(productId)?.name || "Unknown Product";
      return {
        id: doc.id,
        sku: data.sku,
        size: data.size,
        color: data.color,
        priceMinor: data.priceMinor || 0,
        stockAvailable: data.stockAvailable || 0,
        stockReserved: data.stockReserved || 0,
        productId,
        variantPath: doc.ref.path,
        productName,
      };
    })
    .filter((variant) => productMap.has(variant.productId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          Manage physical stock and reservations.
        </p>
      </div>

      <InventoryTable initialData={variants} />
    </div>
  );
}
