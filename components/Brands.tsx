"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Brands — an editorial "as seen in / trusted by" band that sits directly
 * beneath the Showcase. Two logo rails drift in opposite directions and pause
 * on hover; a set of headline stats anchors the section with proof.
 */

// Wordmark-style brand logos rendered as tuned typographic SVGs so they stay
// crisp at any size and inherit the amber/stone palette on hover.
type Brand = { name: string; render: () => React.ReactNode };

const brands: Brand[] = [
  {
    name: "AURELIA",
    render: () => (
      <span className="font-heading text-2xl font-bold italic tracking-tight sm:text-3xl">
        Aurelia
      </span>
    ),
  },
  {
    name: "MERIDIAN",
    render: () => (
      <span className="text-xl font-semibold uppercase tracking-[0.4em] sm:text-2xl">
        Meridian
      </span>
    ),
  },
  {
    name: "VESTRA",
    render: () => (
      <span className="font-heading text-2xl font-bold tracking-wide sm:text-3xl">
        VESTRA<span className="text-amber-400">.</span>
      </span>
    ),
  },
  {
    name: "NORTH & CO",
    render: () => (
      <span className="text-lg font-medium uppercase tracking-[0.25em] sm:text-xl">
        North<span className="mx-1 font-light">&amp;</span>Co
      </span>
    ),
  },
  {
    name: "LUMEN",
    render: () => (
      <span className="text-2xl font-light uppercase tracking-[0.5em] sm:text-3xl">
        Lumen
      </span>
    ),
  },
  {
    name: "ATELIER",
    render: () => (
      <span className="font-heading text-2xl font-semibold italic tracking-tight sm:text-3xl">
        Atelier 9
      </span>
    ),
  },
  {
    name: "SABLE",
    render: () => (
      <span className="text-xl font-bold uppercase tracking-[0.35em] sm:text-2xl">
        Sablé
      </span>
    ),
  },
  {
    name: "MONOLITH",
    render: () => (
      <span className="text-lg font-semibold uppercase tracking-[0.3em] sm:text-xl">
        Monolith
      </span>
    ),
  },
];

const stats = [
  { value: "40+", label: "Global partners" },
  { value: "1.2M", label: "Pieces delivered" },
  { value: "68", label: "Countries served" },
  { value: "4.9", label: "Average rating" },
];

// Duplicate the list so the translateX(-50%) loop is perfectly seamless.
const rail = [...brands, ...brands];

function LogoRail({ direction }: { direction: "left" | "right" }) {
  return (
    <div className="marquee-mask overflow-hidden py-2">
      <div
        className={`marquee-track ${
          direction === "left" ? "marquee-left" : "marquee-right"
        }`}
      >
        {rail.map((brand, i) => (
          <div
            key={`${brand.name}-${i}`}
            className="group/logo mx-6 flex h-16 shrink-0 items-center justify-center px-8 sm:mx-8 sm:px-10"
          >
            <span className="text-stone-500 opacity-60 transition-all duration-500 group-hover/logo:scale-105 group-hover/logo:text-amber-300 group-hover/logo:opacity-100">
              {brand.render()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Brands() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="brands"
      aria-label="Brands and partners"
      className="relative overflow-hidden bg-stone-950 py-24 sm:py-32"
    >
      {/* Ambient depth glows, matching the Showcase above */}
      <div
        aria-hidden="true"
        className="aurora pointer-events-none absolute -top-1/4 left-1/2 h-[45vh] w-[45vh] -translate-x-1/2 rounded-full bg-amber-600/15 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="aurora pointer-events-none absolute bottom-0 right-0 h-[35vh] w-[35vh] rounded-full bg-amber-400/10 blur-[110px]"
        style={{ animationDelay: "-11s" }}
      />

      {/* Header */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
        <motion.p
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-400"
        >
          Trusted Worldwide
        </motion.p>
        <motion.h2
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-4 max-w-3xl font-heading text-4xl font-bold leading-[1.05] text-white sm:text-6xl"
        >
          The Houses We Keep{" "}
          <span className="italic text-amber-300">Company</span>
        </motion.h2>
        <motion.p
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-stone-400"
        >
          From heritage ateliers to modern design studios — a curated network of
          makers behind every piece in the collection.
        </motion.p>
      </div>

      {/* Dual marquee rails */}
      <motion.div
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1, delay: 0.2 }}
        className="marquee-group relative z-10 mt-16 flex flex-col gap-4 sm:mt-20"
      >
        <LogoRail direction="left" />
        <LogoRail direction="right" />
      </motion.div>

      {/* Proof stats */}
      <div className="relative z-10 mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-x-6 gap-y-12 px-6 sm:mt-24 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.7,
              delay: i * 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="group text-center"
          >
            <p className="font-heading text-4xl font-bold text-white transition-colors duration-300 group-hover:text-amber-300 sm:text-5xl">
              {stat.value}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
