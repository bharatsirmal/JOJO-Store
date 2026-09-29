import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import { ProductVariant, CatalogProduct } from "@/types";
import { InventoryTable } from "@/components/admin/InventoryTable";

export default async function AdminInventoryPage() {
  await requireAdmin();

  if (!adminDb) {
    return <div className="p-8">Firebase Admin not configured.</div>;
  }

  // In a massive catalog we would use pagination. For Phase 6 requirements, a simple fetch is fine.
  const variantsSnap = await adminDb.collection("variants").get();
  const productsSnap = await adminDb.collection("products").get();

  const productMap = new Map<string, CatalogProduct>();
  productsSnap.forEach(doc => {
    productMap.set(doc.id, { id: doc.id, ...doc.data() } as CatalogProduct);
  });

  const variants = variantsSnap.docs.map(doc => {
    const data = doc.data() as Omit<ProductVariant, 'id'>;
    const productName = productMap.get(data.productId)?.name || "Unknown Product";
    return {
      id: doc.id,
      ...data,
      productName
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">Manage physical stock and reservations.</p>
      </div>

      <InventoryTable initialData={variants} />
    </div>
  );
}