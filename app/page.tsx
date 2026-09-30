import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedShowcase from "@/components/FeaturedShowcase";
import Brands from "@/components/Brands";
import ProductsGrid from "@/components/ProductsGrid";
import Reviews from "@/components/Reviews";
import TrustSection from "@/components/TrustSection";
import Footer from "@/components/Footer";
import { getProducts } from "@/lib/products/getProducts";

/**
 * The landing page keeps its original section order, 3D scroll and animations.
 * The only change is that the catalogue sections now receive live products
 * from the data layer (Supabase, or the local store during development).
 *
 * ISR keeps the cinematic first paint fast; admin mutations call
 * `revalidateStorefront()` so edits still show up immediately.
 */
export const revalidate = 60;

export default async function Home() {
  const products = await getProducts({ limit: 48 });

  return (
    <main className="flex-1">
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedShowcase products={products} />
      <Brands />
      <ProductsGrid products={products} catalogueHref="/shop" />
      <Reviews />
      <TrustSection />
      <Footer />
    </main>
  );
}
