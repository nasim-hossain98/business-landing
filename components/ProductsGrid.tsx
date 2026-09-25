"use client";

import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Check, Star, ArrowUpRight } from "lucide-react";
import { products } from "@/data/products";
import Tilt3D from "@/components/ui/Tilt3D";
import { useCart } from "@/components/providers/CartContext";
import { getDefaultOption } from "@/components/ProductOptions";
import type { Product } from "@/data/products";
import { categories } from "@/data/categories";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

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

/** Single product card with a cinematic 3D scroll-reveal entrance. */
function ProductCard({
  product,
  index,
  added,
  onAdd,
}: {
  product: Product;
  index: number;
  added: boolean;
  onAdd: (p: Product) => void;
}) {
  const prefersReduced = useReducedMotion();

  const cardVariants: Variants = {
    hidden: prefersReduced
      ? { opacity: 1 }
      : { opacity: 0, y: 72, rotateX: 16, scale: 0.93 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        duration: 0.85,
        delay: prefersReduced ? 0 : (index % 4) * 0.09,
        ease: EASE,
      },
    },
    exit: prefersReduced
      ? { opacity: 0 }
      : { opacity: 0, y: -28, scale: 0.92, transition: { duration: 0.4, ease: EASE } },
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      exit="exit"
      viewport={{ once: true, amount: 0.15 }}
      style={{ transformStyle: "preserve-3d" }}
      className="[transform-style:preserve-3d]"
    >
      <Link
        href={`/product/${product.id}`}
        className="group block h-full rounded-[1.75rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-950"
      >
        <Tilt3D className="h-full" max={9}>
          <article className="preserve-3d relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-stone-200/70 bg-white shadow-[0_2px_10px_-4px_rgba(28,25,23,0.1)] transition-all duration-500 hover:-translate-y-1 hover:border-amber-300/60 hover:shadow-[0_30px_70px_-28px_rgba(217,119,6,0.45)] dark:border-stone-800 dark:bg-stone-900">
            {/* Badge */}
            {product.badge && (
              <div className="absolute left-4 top-4 z-20 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-lg shadow-amber-500/30">
                {product.badge}
              </div>
            )}

            {/* Rating chip */}
            <div className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-stone-800 shadow-md backdrop-blur-md dark:bg-stone-950/80 dark:text-stone-100">
              <Star size={11} className="fill-amber-500 text-amber-500" />
              {product.rating.toFixed(1)}
            </div>

            {/* Image */}
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.12]"
              />
              {/* Cinematic gradient wash on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Quick-view pill slides up on hover */}
              <div className="absolute inset-x-0 bottom-0 flex translate-y-6 items-center justify-center pb-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-900 shadow-xl backdrop-blur">
                  View Details
                  <ArrowUpRight size={13} />
                </span>
              </div>
            </div>

            {/* Body — lifted in 3D space above the card */}
            <div
              className="flex flex-1 flex-col p-6"
              style={{ transform: "translateZ(45px)" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-600">
                  {categoryLabel[product.category]}
                </p>
                <span className="text-[10px] font-medium tracking-wide text-stone-400">
                  {product.reviewCount} reviews
                </span>
              </div>

              <h3 className="mt-1.5 font-heading text-xl font-semibold leading-snug text-stone-900 transition-colors duration-300 group-hover:text-amber-700 dark:text-white dark:group-hover:text-amber-400">
                {product.name}
              </h3>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400">
                    Price
                  </span>
                  <span className="text-xl font-bold text-stone-900 dark:text-white">
                    ৳{product.price.toFixed(2)}
                  </span>
                </div>
                <button
                  aria-label={`Add ${product.name} to cart`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAdd(product);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 active:scale-95 ${
                    added
                      ? "bg-emerald-500 text-white"
                      : "bg-stone-900 text-white hover:bg-amber-500 dark:bg-white dark:text-stone-900 dark:hover:bg-amber-500 dark:hover:text-white"
                  }`}
                >
                  {added ? (
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
          </article>
        </Tilt3D>
      </Link>
    </motion.div>
  );
}

export default function ProductsGrid({
  initialCategory = "all",
  hideHeader = false,
}: ProductsGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>(initialCategory);
  const [addedId, setAddedId] = useState<number | null>(null);
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
    addItem(product, getDefaultOption(product.id));
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
            </motion.div>
          </motion.div>
        ) : (
          <div className="flex justify-center">
            <FilterBar active={activeFilter} onChange={setActiveFilter} />
          </div>
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
