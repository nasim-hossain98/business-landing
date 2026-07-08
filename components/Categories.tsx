"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { categories } from "@/data/categories";

/**
 * Categories — 4 category cards with image zoom on hover,
 * gradient overlay labels, and staggered scroll-reveal animation.
 */
export default function Categories() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="categories"
      className="bg-zinc-50 dark:bg-zinc-900/50 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <AnimatedSection className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
            Browse
          </p>
          <h2 className="mt-2 font-heading text-4xl font-bold text-zinc-900 dark:text-white sm:text-5xl">
            Shop by Category
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
            Explore our curated collections of premium clothing and accessories
          </p>
        </AnimatedSection>

        {/* Category grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <AnimatedSection key={cat.slug} delay={i * 0.15}>
              <Link href={`/category/${cat.slug}`} className="group block">
                <motion.div
                  whileHover={prefersReduced ? {} : { y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-md"
                >
                  {/* Image with zoom on hover */}
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-heading text-2xl font-bold text-white">
                      {cat.label}
                    </h3>
                    <p className="mt-1 text-sm text-white/70">{cat.description}</p>
                    <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-400 transition-all duration-300 group-hover:gap-2">
                      Explore
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
