import Link from "next/link";
import type { Metadata } from "next";
import { getProducts } from "@/lib/products/getProducts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductsGrid from "@/components/ProductsGrid";
import AnimatedSection from "@/components/ui/AnimatedSection";

/**
 * /shop — the full catalogue.
 *
 * A Server Component: products are fetched on the server and handed to the
 * interactive `ProductsGrid` (filtering, 3D reveal, add-to-cart). ISR keeps it
 * fast while `revalidateStorefront()` pushes admin edits out immediately.
 */
export const revalidate = 30;

export const metadata: Metadata = {
  title: "Shop — LUXE",
  description:
    "Browse the complete LUXE collection: premium clothing, leather wallets, bags and accessories.",
};

export default async function ShopPage() {
  const products = await getProducts({ limit: 100 });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 bg-white dark:bg-stone-950">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <AnimatedSection>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-500">
              The Collection
            </p>
            <h1 className="mt-4 font-heading text-5xl font-bold text-stone-900 dark:text-white sm:text-6xl">
              Shop Everything
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-500 dark:text-stone-400">
              {products.length} pieces in the catalogue — filter by category, add
              to your cart and check out in a few taps.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/track-order"
                className="inline-flex items-center rounded-full border border-stone-300 dark:border-stone-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600 dark:text-stone-300 transition-colors duration-300 hover:border-amber-400 hover:text-amber-600"
              >
                Track an order
              </Link>
              <Link
                href="/cart"
                className="inline-flex items-center rounded-full border border-stone-300 dark:border-stone-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600 dark:text-stone-300 transition-colors duration-300 hover:border-amber-400 hover:text-amber-600"
              >
                View cart
              </Link>
            </div>
          </AnimatedSection>
        </div>

        <ProductsGrid products={products} hideHeader />
      </main>

      <Footer />
    </div>
  );
}
