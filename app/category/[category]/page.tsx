import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { categories, getCategoryBySlug } from "@/data/categories";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductsGrid from "@/components/ProductsGrid";
import AnimatedSection from "@/components/ui/AnimatedSection";

// Map each URL slug to the Product.category value used in data/products.ts.
const slugToDataCategory: Record<string, string> = categories.reduce(
  (acc, c) => {
    acc[c.slug] = c.dataCategory;
    return acc;
  },
  {} as Record<string, string>
);

// Statically generate a page for every known category slug.
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

  const initialCategory = slugToDataCategory[category] as
    | "all"
    | "clothes"
    | "wallets"
    | "bags"
    | "others";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6">
          {/* Back link */}
          <div className="py-6">
            <Link
              href="/#categories"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-amber-500 transition-colors"
            >
              <ChevronLeft size={16} />
              Back to Categories
            </Link>
          </div>

          {/* Category heading (page supplies its own, grid header hidden) */}
          <AnimatedSection className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
              Category
            </p>
            <h1 className="mt-2 font-heading text-4xl font-bold text-zinc-900 dark:text-white sm:text-5xl">
              {cat.label}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
              {cat.description}
            </p>
          </AnimatedSection>

          <ProductsGrid initialCategory={initialCategory} hideHeader />
        </div>
      </main>

      <Footer />
    </div>
  );
}
