"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Star, Sparkles, ArrowUpRight } from "lucide-react";
import HeroCanvas from "@/components/three/HeroCanvas";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ------------------------------------------------------------------
// Editorial hero — cinematic, tactile, asymmetrical.
// Left: typography-led story + social proof. Right: layered 3D
// product stage that floats, tilts, and parallaxes on scroll/pointer.
// ------------------------------------------------------------------

export default function Hero() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // ---- Background depth on scroll
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.18]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.45]);
  const washOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.55]);
  const vignetteOpacity = useTransform(scrollYProgress, [0, 1], [0.95, 0]);

  // ---- Content lifts faster than background
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.58], [1, 0]);

  // ---- Right stage: recedes & tilts on scroll (true 3D exit)
  const stageY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const stageRotateX = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const stageOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // ---- Pointer parallax (springs so it feels physical)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 50, damping: 18, mass: 0.6 });
  const contentShiftX = useTransform(sx, [-0.5, 0.5], [14, -14]);
  const contentShiftY = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const stageShiftX = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const stageShiftY = useTransform(sy, [-0.5, 0.5], [-12, 12]);

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (prefersReduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onPointerLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <section
      id="hero"
      ref={sectionRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative overflow-hidden bg-[#fefcf8]"
    >
      {/* ================================================================
          CINEMATIC BACKGROUND
          ================================================================ */}
      <motion.div
        className="absolute inset-0"
        style={prefersReduced ? undefined : { scale: bgScale, y: bgY, opacity: bgOpacity }}
      >
        {/* Base cream + subtle warm radial */}
        <div className="absolute inset-0 bg-[#fefcf8]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_88%_70%_at_52%_28%,rgba(245,158,11,0.14),transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_52%_at_78%_92%,rgba(251,207,132,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_85%,rgba(244,114,182,0.08),transparent_60%)]" />

        {/* Editorial photograph — ghosted for texture, never competing */}
        <div
          className="absolute inset-0 opacity-[0.07] mix-blend-multiply"
          style={{
            backgroundImage: "url(/images/hero-bg.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center 32%",
            filter: "saturate(0.85) contrast(1.05)",
          }}
        />

        {/* Large faint wordmark */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
        >
          <span className="font-heading text-[28vw] font-bold leading-none tracking-[-0.06em] text-stone-900/[0.035] translate-y-[6%]">
            LUXE
          </span>
        </div>

        {/* Drifting aurora blobs */}
        <div className="aurora absolute -left-[14%] top-[4%] h-[56vh] w-[56vh] rounded-full bg-amber-300/22 blur-[110px]" />
        <div
          className="aurora absolute -right-[10%] top-[14%] h-[48vh] w-[52vh] rounded-full bg-orange-200/22 blur-[120px]"
          style={{ animationDelay: "-7s" }}
        />
        <div
          className="aurora absolute left-[22%] bottom-[-6%] h-[52vh] w-[62vh] rounded-full bg-amber-200/18 blur-[130px]"
          style={{ animationDelay: "-13s" }}
        />

        {/* Warm light sweep */}
        {!prefersReduced && (
          <motion.div
            className="absolute top-[-20%] bottom-[-20%] w-[28rem] -skew-x-12 bg-gradient-to-r from-transparent via-amber-200/45 to-transparent"
            initial={{ x: "-80vw", opacity: 0 }}
            animate={{ x: "125vw", opacity: [0, 0.55, 0] }}
            transition={{ duration: 2.8, delay: 1.4, ease: "easeInOut" }}
          />
        )}

        {/* Dissolve to cream on scroll */}
        <motion.div className="absolute inset-0 bg-[#fefcf8]" style={prefersReduced ? undefined : { opacity: washOpacity }} />
      </motion.div>

      {/* WebGL — subtle depth veil behind the editorial layer */}
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.32]" aria-hidden>
        <HeroCanvas scrollProgress={scrollYProgress} reducedMotion={!!prefersReduced} />
      </div>

      {/* Luminous halo that keeps the headline legible */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2]"
        style={prefersReduced ? undefined : { opacity: vignetteOpacity }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_58%_at_32%_46%,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.62)_42%,transparent_74%)] lg:bg-[radial-gradient(ellipse_58%_62%_at_34%_50%,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.55)_45%,transparent_76%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.42),transparent_28%,transparent_72%,rgba(254,252,248,0.9))]" />
      </motion.div>

      {/* Film grain + vignette */}
      <div className="hero-grain !z-[3] opacity-[0.04]" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 50%, transparent 58%, rgba(28,25,23,0.07) 100%)",
        }}
      />

      {/* Top hairline — maison bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden h-px bg-gradient-to-r from-transparent via-stone-300/60 to-transparent lg:block" />

      {/* ================================================================
          CONTENT GRID
          ================================================================ */}
      <motion.div
        className="relative z-10 mx-auto grid min-h-[100dvh] max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-28 lg:grid-cols-12 lg:gap-6 lg:px-8 lg:pb-10 lg:pt-28"
        style={prefersReduced ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        {/* ----------------------------- Left — editorial copy ----------------------------- */}
        <motion.div
          className="order-1 lg:col-span-7 will-change-transform"
          style={prefersReduced ? undefined : { x: contentShiftX, y: contentShiftY }}
        >
          {/* Eyebrow + maison line */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: EASE }}
            className="mb-7 flex flex-wrap items-center gap-3"
          >
            <span className="hidden h-px w-10 bg-stone-300 sm:block" />
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-white px-3.5 py-1.5 text-[10px] font-semibold tracking-[0.22em] text-amber-700 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              NEW COLLECTION — FW 2025
            </span>
            <span className="hidden items-center gap-2 text-[10px] font-medium tracking-[0.2em] text-stone-400 sm:inline-flex">
              <span className="h-px w-6 bg-stone-200" />
              MAISON LUXE · EST. 2019
            </span>
          </motion.div>

          {/* Headline — asymmetric, editorial, tight */}
          <h1 className="font-heading text-[3.5rem] font-bold leading-[0.9] tracking-[-0.045em] text-stone-900 sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[7.5rem]">
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="inline-block will-change-transform"
                initial={prefersReduced ? false : { y: "110%", rotate: 3 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 1.05, delay: 0.28, ease: EASE }}
              >
                Define
              </motion.span>{" "}
              <motion.span
                className="inline-block will-change-transform font-light tracking-[-0.05em] text-stone-700"
                initial={prefersReduced ? false : { y: "110%", rotate: 3 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 1.05, delay: 0.38, ease: EASE }}
              >
                Your
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.18em]">
              <motion.span
                className="hero-shimmer inline-block bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 bg-clip-text pr-[0.12em] font-heading italic tracking-[-0.05em] text-transparent"
                initial={prefersReduced ? false : { y: "110%", rotate: 3 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 1.05, delay: 0.48, ease: EASE }}
              >
                Signature
              </motion.span>
            </span>
            <span className="block -mt-1 overflow-hidden pb-[0.12em]">
              <motion.span
                className="inline-flex items-baseline gap-3 will-change-transform"
                initial={prefersReduced ? false : { y: "110%", rotate: 3 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 1.05, delay: 0.58, ease: EASE }}
              >
                <span className="font-heading font-bold tracking-[-0.05em]">Style</span>
                <span className="hidden h-[1.5px] w-16 translate-y-[-0.5em] bg-gradient-to-r from-amber-400 to-transparent sm:inline-block" />
                <span className="hidden translate-y-[-0.18em] font-body text-[10px] font-semibold tracking-[0.3em] text-stone-400 sm:inline-block">
                  VOL. III
                </span>
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.82, ease: EASE }}
            className="mt-6 max-w-[38rem] text-[15px] leading-7 text-stone-600 sm:text-[17px] sm:leading-8"
          >
            Premium clothing, leather goods &amp; accessories — cut, stitched and
            finished for a lifetime. Quiet luxury, built to be worn every day.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.95, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <a
              href="#products"
              className="group inline-flex items-center gap-3 rounded-full bg-stone-900 px-8 py-4 text-[13px] font-semibold tracking-[0.16em] text-white shadow-xl shadow-stone-900/15 transition-all duration-500 hover:-translate-y-0.5 hover:bg-black hover:shadow-2xl hover:shadow-stone-900/20 active:translate-y-0"
            >
              Shop Collection
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-stone-900 transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight size={14} />
              </span>
            </a>
            <a
              href="#categories"
              className="group inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-7 py-4 text-[13px] font-semibold tracking-[0.16em] text-stone-800 backdrop-blur transition-all duration-500 hover:border-stone-900 hover:bg-stone-900 hover:text-white"
            >
              Explore Lookbook
              <ArrowUpRight size={15} className="opacity-60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            </a>
          </motion.div>

          {/* Proof row */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.12, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-6 border-t border-stone-200 pt-7"
          >
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {["/images/product-4.jpg", "/images/product-1.jpg", "/images/product-7.jpg"].map((src) => (
                  <span
                    key={src}
                    className="h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-stone-100 shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </span>
                ))}
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-stone-900 text-[10px] font-bold tracking-widest text-white">
                  50K+
                </span>
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-500" />
                  ))}
                  <span className="ml-1 text-xs font-bold tracking-widest text-stone-900">4.9/5</span>
                </div>
                <p className="text-xs font-medium tracking-wide text-stone-500">
                  Loved by 50,000+ clients worldwide
                </p>
              </div>
            </div>

            <div className="hidden h-10 w-px bg-stone-200 sm:block" />

            <div className="flex items-center gap-6 text-xs">
              <span className="flex items-center gap-2 font-medium tracking-wide text-stone-600">
                <span className="h-1 w-1 rounded-full bg-emerald-500" /> Free shipping over ৳5,000
              </span>
              <span className="hidden items-center gap-2 font-medium tracking-wide text-stone-600 sm:flex">
                <span className="h-1 w-1 rounded-full bg-stone-400" /> 30-day returns
              </span>
            </div>
          </motion.div>

          {/* Press strip — tiny, editorial */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.28 }}
            className="mt-6 hidden items-center gap-5 text-[10px] font-semibold tracking-[0.2em] text-stone-400 lg:flex"
          >
            <span>FEATURED IN</span>
            <span className="h-px w-8 bg-stone-200" />
            <span className="font-heading text-sm font-bold tracking-[0.14em] text-stone-700">VOGUE</span>
            <span className="font-heading text-sm font-bold tracking-[0.14em] text-stone-700">GQ</span>
            <span className="font-heading text-sm font-bold tracking-[0.14em] text-stone-700">ESQUIRE</span>
            <span className="font-heading text-sm font-bold tracking-[0.14em] text-stone-700">ELLE</span>
          </motion.div>
        </motion.div>

        {/* ----------------------------- Right — 3D product stage ----------------------------- */}
        <div className="order-2 lg:col-span-5">
          <motion.div
            className="relative mx-auto w-full max-w-[520px] lg:ml-auto lg:mr-0"
            style={
              prefersReduced
                ? undefined
                : { y: stageY, rotateX: stageRotateX, scale: stageScale, opacity: stageOpacity, x: stageShiftX }
            }
          >
            {/* Perspective container */}
            <div className="perspective-near">
              <motion.div
                className="relative preserve-3d will-change-transform"
                style={prefersReduced ? undefined : { y: stageShiftY }}
                initial={prefersReduced ? false : { opacity: 0, y: 40, rotateX: 12 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 1.2, delay: 0.45, ease: EASE }}
              >
                {/* Main stage card — hero photograph */}
                <div className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-2 shadow-[0_28px_80px_-20px_rgba(28,25,23,0.28),0_12px_32px_-16px_rgba(28,25,23,0.18)]">
                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/hero-bg.jpg"
                      alt="LUXE signature look"
                      className="h-full w-full object-cover"
                    />
                    {/* Cinematic gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/55 via-stone-900/8 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_30%,transparent_40%,rgba(0,0,0,0.18)_100%)]" />

                    {/* Top badges */}
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-stone-900 shadow-lg">
                        <Sparkles size={12} className="text-amber-500" /> NEW SEASON
                      </span>
                      <span className="hidden rounded-full bg-stone-900 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-white sm:inline-flex">
                        FW 2025
                      </span>
                    </div>

                    {/* Bottom info bar */}
                    <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 sm:inset-x-4 sm:bottom-4">
                      <div className="rounded-2xl bg-white/95 px-4 py-3 shadow-xl backdrop-blur-xl">
                        <p className="text-[10px] font-semibold tracking-[0.18em] text-stone-500">SIGNATURE PIECE</p>
                        <p className="font-heading text-[15px] font-bold leading-none tracking-tight text-stone-900">
                          Wool Blend Overcoat
                        </p>
                        <p className="mt-1 text-xs font-medium text-stone-500">From ৳12,900 · 4 colours</p>
                      </div>
                      <a
                        href="#products"
                        className="hidden h-11 w-11 items-center justify-center rounded-full bg-white text-stone-900 shadow-xl transition hover:scale-105 sm:inline-flex"
                        aria-label="Shop collection"
                      >
                        <ArrowRight size={16} />
                      </a>
                    </div>

                    {/* Corner brackets — cinematic frame */}
                    <span className="pointer-events-none absolute left-4 top-4 h-6 w-6 rounded-tl-2xl border-l-2 border-t-2 border-white/70" />
                    <span className="pointer-events-none absolute bottom-4 right-4 h-6 w-6 rounded-br-2xl border-b-2 border-r-2 border-white/70" />
                  </div>

                  {/* Spec strip under image */}
                  <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-3 sm:px-3">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="rounded-full bg-stone-900 px-2.5 py-1 font-bold tracking-widest text-white">01</span>
                      <span className="font-medium tracking-wide text-stone-600">Lookbook — 18 looks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-6 rounded-full bg-stone-900" />
                      <span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
                      <span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
                    </div>
                  </div>
                </div>

                {/* Floating card — wallet (top right, lifts on pointer) */}
                <motion.div
                  className="absolute -right-2 top-[6%] hidden w-[148px] sm:block lg:-right-6 lg:w-[168px]"
                  initial={prefersReduced ? false : { y: 18, opacity: 0, rotate: -4 }}
                  animate={{ y: 0, opacity: 1, rotate: -2 }}
                  transition={{ duration: 0.9, delay: 0.95, ease: EASE }}
                  style={
                    prefersReduced
                      ? undefined
                      : { y: useTransform(sy, [-0.5, 0.5], [-10, 10]) as any, rotate: -2 as any }
                  }
                >
                  <div className="rounded-2xl border border-white/70 bg-white p-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-stone-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/product-2.jpg" alt="Leather wallet" className="h-full w-full object-cover" />
                    </div>
                    <div className="px-1 pb-1 pt-2">
                      <p className="text-[10px] font-bold tracking-[0.14em] text-amber-600">BESTSELLER</p>
                      <p className="text-xs font-bold leading-tight text-stone-900">Bifold Wallet</p>
                      <p className="text-xs font-semibold text-stone-500">৳5,999</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating card — tote (mid-left edge, clears the info bar) */}
                <motion.div
                  className="absolute bottom-[20%] -left-4 hidden w-[150px] sm:block lg:-left-12 lg:w-[172px]"
                  initial={prefersReduced ? false : { y: 18, opacity: 0, rotate: 3 }}
                  animate={{ y: 0, opacity: 1, rotate: 2 }}
                  transition={{ duration: 0.9, delay: 1.05, ease: EASE }}
                  style={
                    prefersReduced
                      ? undefined
                      : { y: useTransform(sy, [-0.5, 0.5], [12, -8]) as any }
                  }
                >
                  <div className="rounded-2xl border border-white/70 bg-white p-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-stone-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/product-3.jpg" alt="Canvas tote" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex items-center justify-between px-1 pb-1 pt-2">
                      <div>
                        <p className="text-xs font-bold leading-tight text-stone-900">Canvas Tote</p>
                        <p className="text-xs font-semibold text-stone-500">৳7,999</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold tracking-widest text-emerald-700">
                        IN STOCK
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Subtle depth ring behind stage */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.6rem] border border-amber-200/30 bg-gradient-to-br from-amber-50 to-white opacity-70 blur-[0.5px]"
                />
              </motion.div>
            </div>

            {/* Caption under stage — editorial detail */}
            <motion.p
              initial={prefersReduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.35, duration: 0.8 }}
              className="mx-auto mt-6 max-w-[28rem] text-center text-[11px] font-medium leading-relaxed tracking-wide text-stone-500 lg:text-left"
            >
              <span className="font-semibold tracking-[0.14em] text-stone-700">MAISON LUXE ATELIER</span> — Photographed on location.
              Natural light, honest materials. No retouching on texture.
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue — cinematic */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8, ease: EASE }}
        className="pointer-events-none absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex"
        aria-hidden
      >
        <span className="text-[10px] font-semibold tracking-[0.22em] text-stone-400">SCROLL</span>
        <span className="relative flex h-10 w-px overflow-hidden rounded-full bg-stone-200">
          <motion.span
            className="absolute left-0 top-0 h-10 w-px bg-stone-900"
            animate={prefersReduced ? {} : { y: ["-100%", "100%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>

      {/* Bottom fade into next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-24 bg-gradient-to-t from-[#fefcf8] to-transparent"
      />
    </section>
  );
}
