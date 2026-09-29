import { getPublishedProducts } from "@/lib/catalog";
import { HomeClient } from "@/components/HomeClient";

export default async function HomePage() {
  const latestProducts = await getPublishedProducts({ limit: 8 });
  
  return <HomeClient featuredProducts={latestProducts} />;
}

