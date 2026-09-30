import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { categories, getCategoryBySlug } from "@/data/categories";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductsGrid from "@/components/ProductsGrid";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { getProducts } from "@/lib/products/getProducts";
import type { ProductCategory } from "@/lib/products/types";

/** Category pages read the live catalogue, so admin edits appear here too. */
export const revalidate = 30;

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);

  if (!cat) {
    notFound();
  }

  const products = await getProducts({
    category: cat.dataCategory as ProductCategory,
    limit: 48,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-white dark:bg-stone-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="py-6">
            <Link
              href="/#categories"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-amber-500 transition-colors duration-300"
            >
              <ChevronLeft size={16} />
              Back to Categories
            </Link>
          </div>

          <AnimatedSection className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">
              Category
            </p>
            <h1 className="mt-4 font-heading text-5xl font-bold text-stone-900 dark:text-white sm:text-6xl">
              {cat.label}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-stone-500 dark:text-stone-400 leading-relaxed">
              {cat.description}
            </p>
          </AnimatedSection>

          <ProductsGrid
            products={products}
            initialCategory={cat.dataCategory}
            hideHeader
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
