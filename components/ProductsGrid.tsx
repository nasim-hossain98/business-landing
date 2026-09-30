"use client";

import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { useCart } from "@/components/providers/CartContext";
import { getDefaultOption } from "@/components/ProductOptions";
import type { Product } from "@/data/products";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const filterTabs = [
  { label: "All", value: "all" },
  { label: "Clothes", value: "clothes" },
  { label: "Wallets", value: "wallets" },
  { label: "Bags", value: "bags" },
  { label: "Accessories", value: "others" },
] as const;

type FilterValue = (typeof filterTabs)[number]["value"];

type ProductsGridProps = {
  /**
   * Catalogue to render. Supplied by the server component that owns the page
   * (Supabase / local store), so the grid itself stays data-source agnostic.
   */
  products: Product[];
  initialCategory?: FilterValue;
  hideHeader?: boolean;
  /** Shows a "browse the full catalogue" link next to the filter pills. */
  catalogueHref?: string;
};

/** Segmented pill control for filtering by category. */
function FilterBar({
  active,
  onChange,
}: {
  active: FilterValue;
  onChange: (v: FilterValue) => void;
}) {
  return (
    <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-stone-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur-xl dark:border-stone-800 dark:bg-stone-900/70">
      {filterTabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`relative shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-300 ${
            active === tab.value
              ? "text-white"
              : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
          }`}
        >
          {active === tab.value && (
            <motion.span
              layoutId="activeFilter"
              className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 shadow-md shadow-amber-500/30"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
export default function ProductsGrid({
  products,
  initialCategory = "all",
  hideHeader = false,
  catalogueHref,
}: ProductsGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>(initialCategory);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addItem } = useCart();
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);

  // Cinematic scroll: header drifts + a light beam sweeps as the section enters.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const headerY = useTransform(scrollYProgress, [0, 0.35], ["60px", "0px"]);
  const beamY = useTransform(scrollYProgress, [0, 1], ["-10%", "60%"]);

  const filtered =
    activeFilter === "all"
      ? products
      : products.filter((p: Product) => p.category === activeFilter);

  function handleAdd(product: Product) {
    addItem(product, getDefaultOption(product.options));
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  }

  return (
    <section
      id="products"
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-white via-amber-50/30 to-white py-28 dark:from-stone-950 dark:via-stone-950 dark:to-stone-950 sm:py-36"
    >
      {/* Ambient backdrop — soft grid + drifting light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(120,113,108,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,113,108,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 35%, #000 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 35%, #000 30%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="aurora pointer-events-none absolute -left-[10%] top-[8%] h-[42vh] w-[42vh] rounded-full bg-amber-300/20 blur-[120px] dark:bg-amber-600/15"
      />
      <div
        aria-hidden
        className="aurora pointer-events-none absolute -right-[8%] top-[30%] h-[38vh] w-[38vh] rounded-full bg-orange-200/20 blur-[120px] dark:bg-amber-500/10"
        style={{ animationDelay: "-8s" }}
      />
      {/* Vertical light beam that travels on scroll */}
      {!prefersReduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[40vh] w-[36rem] -translate-x-1/2 -skew-y-6 bg-gradient-to-b from-amber-200/25 to-transparent blur-3xl dark:from-amber-500/10"
          style={{ y: beamY }}
        />
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {!hideHeader ? (
          <motion.div
            style={prefersReduced ? undefined : { y: headerY }}
            className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-xl">
              <motion.div
                initial={prefersReduced ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE }}
                className="mb-5 flex items-center gap-3"
              >
                <span className="h-px w-10 bg-amber-500/70" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-600">
                  The Collection
                </span>
              </motion.div>
              <motion.h2
                initial={prefersReduced ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.85, delay: 0.08, ease: EASE }}
                className="font-heading text-5xl font-bold leading-[1.02] tracking-tight text-stone-900 dark:text-white sm:text-6xl md:text-7xl"
              >
                Featured{" "}
                <span className="hero-shimmer bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 bg-clip-text italic text-transparent">
                  Products
                </span>
              </motion.h2>
              <motion.p
                initial={prefersReduced ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
                className="mt-5 max-w-md text-base leading-relaxed text-stone-500 dark:text-stone-400 sm:text-lg"
              >
                Handpicked essentials, ready to wear and carry — each piece a study
                in craft, material and quiet confidence.
              </motion.p>
            </div>

            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
              className="flex flex-col items-start gap-4 lg:items-end"
            >
              <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-stone-400">
                <span className="font-heading text-2xl font-bold text-stone-900 dark:text-white">
                  {filtered.length}
                </span>
                pieces in view
              </span>
              <FilterBar active={activeFilter} onChange={setActiveFilter} />
              {catalogueHref && (
                <Link
                  href={catalogueHref}
                  className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-600 transition-colors duration-300 hover:text-amber-700"
                >
                  Browse the full catalogue
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <FilterBar active={activeFilter} onChange={setActiveFilter} />
            {catalogueHref && (
              <Link
                href={catalogueHref}
                className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600 transition-colors duration-300 hover:text-amber-700"
              >
                Browse the full catalogue →
              </Link>
            )}
          </div>
        )}

        {filtered.length === 0 && (
          <p className="mt-16 text-center text-sm text-stone-500 dark:text-stone-400">
            Nothing in this category yet — please check back soon.
          </p>
        )}

        {/* 3D scroll-reveal grid */}
        <motion.div
          layout
          className="perspective-far mt-16 grid grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                added={addedId === product.id}
                onAdd={handleAdd}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
