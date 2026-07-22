"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { categories } from "@/data/categories";

export default function Categories() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="categories"
      className="bg-cream-50 dark:bg-stone-950/80 py-28 sm:py-36"
    >
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedSection className="text-center mb-18">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">
            Browse
          </p>
          <h2 className="mt-4 font-heading text-5xl font-bold text-stone-900 dark:text-white sm:text-6xl">
            Shop by Category
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-base text-stone-500 dark:text-stone-400 leading-relaxed">
            Explore our curated collections of premium clothing and accessories
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <AnimatedSection key={cat.slug} delay={i * 0.12} direction="scale">
              <Link href={`/category/${cat.slug}`} className="group block">
                <motion.div
                  whileHover={prefersReduced ? {} : { y: -12, scale: 1.02 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-xl"
                >
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-all duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-stone-900/20 via-transparent to-stone-900/90" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="font-heading text-3xl font-bold text-white">
                      {cat.label}
                    </h3>
                    <p className="mt-1.5 text-sm text-stone-400/90">
                      {cat.description}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold tracking-wider text-amber-400 transition-all duration-300 group-hover:gap-3 uppercase">
                      Explore
                      <span className="transition-transform duration-300 group-hover:translate-x-1.5">
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
