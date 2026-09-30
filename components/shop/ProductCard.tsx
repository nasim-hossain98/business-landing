"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Star, ArrowUpRight } from "lucide-react";
import Tilt3D from "@/components/ui/Tilt3D";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { categories } from "@/data/categories";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/data/products";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** dataCategory → human label (kept in sync with data/categories.ts). */
const categoryLabel: Record<Product["category"], string> = categories.reduce(
  (acc, c) => {
    acc[c.dataCategory] = c.label;
    return acc;
  },
  {} as Record<Product["category"], string>,
);

/** Canonical product URL — slug first, legacy numeric id as a fallback. */
export function productHref(product: Pick<Product, "slug" | "id">): string {
  return `/product/${product.slug || product.id}`;
}

/** Single product card with a cinematic 3D scroll-reveal entrance. */
export default function ProductCard({
  product,
  index,
  added,
  onAdd,
}: {
  product: Product;
  index: number;
  added: boolean;
  onAdd: (product: Product) => void;
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
      : {
          opacity: 0,
          y: -28,
          scale: 0.92,
          transition: { duration: 0.4, ease: EASE },
        },
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
        href={productHref(product)}
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
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

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
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <AddToCartButton
                  productName={product.name}
                  added={added}
                  onAdd={() => onAdd(product)}
                />
              </div>
            </div>
          </article>
        </Tilt3D>
      </Link>
    </motion.div>
  );
}
