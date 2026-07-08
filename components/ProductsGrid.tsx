"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { products } from "@/data/products";
import AnimatedSection from "@/components/ui/AnimatedSection";
import type { Product } from "@/data/products";
import { categories } from "@/data/categories";

/** Display label for a product's raw category value. */
const categoryLabel: Record<Product["category"], string> = categories.reduce(
  (acc, c) => {
    acc[c.dataCategory] = c.label;
    return acc;
  },
  {} as Record<Product["category"], string>,
);

const filterTabs = [
  { label: "All", value: "all" },
  { label: "Clothes", value: "clothes" },
  { label: "Wallets", value: "wallets" },
  { label: "Bags", value: "bags" },
  { label: "Accessories", value: "others" },
] as const;

type FilterValue = (typeof filterTabs)[number]["value"];

type ProductsGridProps = {
  /** Pre-selected tab on mount. Defaults to "all". */
  initialCategory?: FilterValue;
  /** When true, the self-contained "Featured Products" header is omitted (the parent supplies its own). */
  hideHeader?: boolean;
};

/**
 * ProductsGrid — filterable product grid with animated tab switching.
 * Cards lift on hover with shadow and image zoom. Reused on the homepage
 * and on category pages.
 */
export default function ProductsGrid({
  initialCategory = "all",
  hideHeader = false,
}: ProductsGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>(initialCategory);
  const prefersReduced = useReducedMotion();

  const filtered =
    activeFilter === "all"
      ? products
      : products.filter((p: Product) => p.category === activeFilter);

  return (
    <section id="products" className="py-24 sm:py-32 bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6">
        {!hideHeader && (
          /* Section header */
          <AnimatedSection className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
              Collection
            </p>
            <h2 className="mt-2 font-heading text-4xl font-bold text-zinc-900 dark:text-white sm:text-5xl">
              Featured Products
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
              Handpicked essentials for every occasion
            </p>
          </AnimatedSection>
        )}

        {/* Filter tabs */}
        <AnimatedSection delay={0.2} className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800/80 p-1.5">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`relative rounded-full px-6 py-2.5 text-sm font-medium transition-colors duration-300 ${
                  activeFilter === tab.value
                    ? "text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {activeFilter === tab.value && (
                  <motion.span
                    layoutId="activeFilter"
                    className="absolute inset-0 rounded-full bg-amber-500 shadow-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Products grid */}
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <Link href={`/product/${product.id}`} className="block focus:outline-none">
                  <motion.article
                    whileHover={
                      prefersReduced
                        ? {}
                        : { y: -6, transition: { duration: 0.3 } }
                    }
                    className="group relative overflow-hidden rounded-2xl bg-zinc-50 dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-shadow duration-500"
                  >
                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-4 left-4 z-10 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                        {product.badge}
                      </div>
                    )}

                    {/* Product image */}
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <p className="text-xs font-medium uppercase tracking-wider text-amber-500 mb-1">
                        {categoryLabel[product.category]}
                      </p>
                      <h3 className="font-heading text-lg font-semibold text-zinc-900 dark:text-white">
                        {product.name}
                      </h3>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xl font-bold text-zinc-900 dark:text-white">
                          ${product.price.toFixed(2)}
                        </span>
                        <button
                          aria-label={`Add ${product.name} to cart`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 transition-all duration-300 hover:bg-amber-500 dark:hover:bg-amber-500 dark:hover:text-white hover:shadow-lg hover:shadow-amber-500/25 active:scale-95"
                        >
                          <ShoppingCart size={16} />
                          Add
                        </button>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
