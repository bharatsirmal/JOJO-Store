import { getPublishedProducts } from "@/lib/catalog";
import { HomeClient } from "@/components/HomeClient";
import { HomeHero } from "@/components/HomeHero";
import { Suspense } from "react";

async function HomeCollections() {
  const latestProducts = await getPublishedProducts({ limit: 8 });
  
  return <HomeClient featuredProducts={latestProducts} />;
}

export default function HomePage() {
  return (
    <main id="main-content" className="store-home">
      <HomeHero />
      <Suspense fallback={<div role="status" className="store-section min-h-64 animate-pulse">Loading collections…</div>}>
        <HomeCollections />
      </Suspense>
    </main>
  );
}

