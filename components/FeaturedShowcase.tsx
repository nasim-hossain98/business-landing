"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { products } from "@/data/products";

// A curated "wave" of hero pieces — the standouts of the catalogue.
const FEATURED_IDS = [1, 5, 7, 2, 3, 10, 6];
const featured = FEATURED_IDS.map((id) => products.find((p) => p.id === id)!).filter(
  Boolean,
);

// Vertical depth offset per card so the row reads as a dimensional gallery.
const DEPTH = [0, -60, 40, -30, 30, -50, 20];

export default function FeaturedShowcase() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Exact horizontal travel in px: full track width minus one viewport, so the
  // last card lands flush against the right edge with no trailing empty space.
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Horizontal travel of the whole track + a gentle 3D turn as it moves.
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [7, 0, -7]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={sectionRef}
      id="showcase"
      className="relative bg-stone-950 h-[320vh]"
      aria-label="Featured collection"
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* Ambient depth glow */}
        <div
          aria-hidden="true"
          className="aurora pointer-events-none absolute -left-1/4 top-1/4 h-[60vh] w-[60vh] rounded-full bg-amber-600/20 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="aurora pointer-events-none absolute right-0 bottom-0 h-[50vh] w-[50vh] rounded-full bg-amber-400/10 blur-[120px]"
          style={{ animationDelay: "-9s" }}
        />

        {/* Section header */}
        <div className="pointer-events-none relative z-20 mx-auto w-full max-w-7xl px-6 pt-24 sm:pt-28">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">
                A New Wave
              </p>
              <h2 className="mt-3 font-heading text-5xl font-bold leading-[1.02] text-white sm:text-7xl">
                The Signature <span className="italic text-amber-300">Edit</span>
              </h2>
            </div>
            <p className="hidden max-w-xs text-sm leading-relaxed text-stone-400 md:block">
              Scroll to travel through the pieces defining the season — each one
              a study in craft and material.
            </p>
          </div>
        </div>

        {/* Horizontal 3D track */}
        <div className="perspective-far relative z-10 flex flex-1 items-center">
          <motion.div
            ref={trackRef}
            className="preserve-3d flex gap-8 px-[6vw] will-change-transform"
            style={
              prefersReduced ? undefined : { x, rotateY }
            }
          >
            {featured.map((product, i) => (
              <motion.div
                key={product.id}
                className="preserve-3d group relative w-[78vw] shrink-0 sm:w-[46vw] lg:w-[30vw]"
                style={
                  prefersReduced
                    ? undefined
                    : { y: DEPTH[i % DEPTH.length], translateZ: (i % 2 ? -80 : 60) }
                }
              >
                <Link
                  href={`/product/${product.id}`}
                  className="block focus:outline-none"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-stone-900 shadow-2xl shadow-black/50 ring-1 ring-white/10 transition-all duration-500 group-hover:ring-amber-400/40">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 30vw"
                      className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-transparent" />
                    {product.badge && (
                      <span className="absolute left-5 top-5 rounded-full border border-amber-300/30 bg-amber-500/15 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-200 backdrop-blur-md">
                        {product.badge}
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-7">
                      <div>
                        <h3 className="font-heading text-2xl font-semibold text-white sm:text-3xl">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-amber-300/90">
                          ৳{product.price.toFixed(2)}
                        </p>
                      </div>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white">
                        <ArrowUpRight size={18} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll progress rail */}
        <div className="relative z-10 mx-auto mb-10 w-full max-w-7xl px-6">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500"
              style={prefersReduced ? { width: "100%" } : { width: progress }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
