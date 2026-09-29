import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";
import { CatalogProduct } from "@/types";

export default async function EditProductPage({ params }: { params: { productId: string } }) {
  await requireAdmin();

  if (!adminDb) {
    return <div className="p-8">Firebase Admin not configured.</div>;
  }

  const doc = await adminDb.collection("products").doc(params.productId).get();
  
  if (!doc.exists) {
    notFound();
  }

  const rawData = doc.data();
  const productData = { 
    id: doc.id, 
    ...rawData,
    createdAt: rawData?.createdAt?.toDate ? rawData.createdAt.toDate().toISOString() : rawData?.createdAt,
    updatedAt: rawData?.updatedAt?.toDate ? rawData.updatedAt.toDate().toISOString() : rawData?.updatedAt,
  } as CatalogProduct;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">Update your product details below.</p>
      </div>

      <ProductForm initialData={productData} productId={params.productId} />
    </div>
  );
}
