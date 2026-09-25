"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { categories } from "@/data/categories";

// Woven column spans give the grid an editorial rhythm instead of 4 equal tiles.
const SPAN = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"];

export default function Categories() {
  const rootRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !rootRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".cat-head > *", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".cat-head", start: "top 85%" },
      });

      gsap.from(".cat-card", {
        y: 64,
        opacity: 0,
        scale: 0.96,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
      });

      // Scrubbed parallax: each image drifts within its frame as the section passes.
      gsap.utils.toArray<HTMLElement>(".cat-img").forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -9 },
          {
            yPercent: 9,
            ease: "none",
            scrollTrigger: {
              trigger: img,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="categories"
      ref={rootRef}
      className="relative overflow-hidden bg-cream-50 dark:bg-stone-950 py-28 sm:py-36"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="cat-head mb-14 max-w-2xl">
          <h2 className="font-heading text-5xl font-bold leading-[1.05] tracking-tight text-stone-900 dark:text-white sm:text-6xl md:text-7xl">
            Shop by <span className="italic text-amber-600">Category</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-stone-500 dark:text-stone-400 sm:text-lg">
            Four curated collections, each built around materials worth keeping.
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-5 md:grid-cols-12"
        >
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`cat-card group relative block h-[380px] overflow-hidden rounded-[1.75rem] bg-stone-900 ring-1 ring-black/5 shadow-[0_24px_70px_-28px_rgba(28,25,23,0.45)] sm:h-[460px] ${SPAN[i % SPAN.length]}`}
            >
              <div className="cat-img absolute inset-x-0 -top-[12%] h-[124%] will-change-transform">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/15 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 transition-colors duration-500 group-hover:from-amber-500/10" />

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-7 sm:p-9">
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300/90">
                    {cat.description}
                  </p>
                  <h3 className="font-heading text-3xl font-semibold text-white sm:text-4xl">
                    {cat.label}
                  </h3>
                </div>
                <span className="flex h-12 w-12 shrink-0 translate-y-1 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:bg-amber-500 group-hover:ring-amber-400">
                  <ArrowUpRight size={20} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
