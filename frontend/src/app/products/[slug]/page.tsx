import { Metadata } from "next";
import { getProductBySlug } from "@/lib/catalog";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/ProductDetailClient";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await getProductBySlug(params.slug);
  if (!result) return { title: "Product Not Found | JOJO Store" };
  
  return {
    title: `${result.product.name} | JOJO Store`,
    description: result.product.description.substring(0, 160),
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const result = await getProductBySlug(params.slug);

  if (!result) {
    notFound();
  }

  return <ProductDetailClient product={result.product} variants={result.variants} />;
}