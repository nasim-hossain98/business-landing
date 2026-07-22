"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { products } from "@/data/products";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useCart } from "@/components/providers/CartContext";
import type { Product } from "@/data/products";
import { categories } from "@/data/categories";

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
  initialCategory?: FilterValue;
  hideHeader?: boolean;
};

export default function ProductsGrid({
  initialCategory = "all",
  hideHeader = false,
}: ProductsGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>(initialCategory);
  const [addedId, setAddedId] = useState<number | null>(null);
  const { addItem } = useCart();
  const prefersReduced = useReducedMotion();

  const filtered =
    activeFilter === "all"
      ? products
      : products.filter((p: Product) => p.category === activeFilter);

  return (
    <section id="products" className="py-28 sm:py-36 bg-white dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-6">
        {!hideHeader && (
          <AnimatedSection className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">
              Collection
            </p>
            <h2 className="mt-4 font-heading text-5xl font-bold text-stone-900 dark:text-white sm:text-6xl">
              Featured Products
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-base text-stone-500 dark:text-stone-400 leading-relaxed">
              Handpicked essentials for every occasion
            </p>
          </AnimatedSection>
        )}

        <AnimatedSection delay={0.2} className="flex justify-center mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-2xl bg-stone-100 dark:bg-stone-800/80 p-1.5 shadow-inner">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`relative rounded-xl px-6 py-3 text-sm font-medium tracking-wider transition-colors duration-300 uppercase ${
                  activeFilter === tab.value
                    ? "text-white"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                {activeFilter === tab.value && (
                  <motion.span
                    layoutId="activeFilter"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </AnimatedSection>

        <motion.div
          layout
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={`/product/${product.id}`} className="block focus:outline-none group">
                  <motion.article
                    whileHover={
                      prefersReduced
                        ? {}
                        : { y: -10, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
                    }
                    className="relative overflow-hidden rounded-3xl bg-stone-50 dark:bg-stone-900 shadow-sm hover:shadow-2xl transition-all duration-500"
                  >
                    {product.badge && (
                      <div className="absolute top-4 left-4 z-10 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-4 py-1.5 text-[10px] font-bold text-white shadow-lg tracking-[0.15em] uppercase">
                        {product.badge}
                      </div>
                    )}
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-all duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-500" />
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500 mb-1.5">
                        {categoryLabel[product.category]}
                      </p>
                      <h3 className="font-heading text-xl font-semibold text-stone-900 dark:text-white">
                        {product.name}
                      </h3>
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-xl font-bold text-stone-900 dark:text-white">
                          ${product.price.toFixed(2)}
                        </span>
                        <button
                          aria-label={`Add ${product.name} to cart`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem(product);
                            setAddedId(product.id);
                            setTimeout(() => setAddedId(null), 1200);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-stone-900 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-stone-900 transition-all duration-300 hover:bg-amber-500 dark:hover:bg-amber-500 dark:hover:text-white hover:shadow-lg hover:shadow-amber-500/30 active:scale-95 tracking-wider uppercase"
                        >
                          {addedId === product.id ? (
                            <>
                              <Check size={14} />
                              Added
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={14} />
                              Add
                            </>
                          )}
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
