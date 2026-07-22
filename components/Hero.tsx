"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={prefersReduced ? {} : { scale: 1.05 }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
      >
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-900/40 via-stone-900/20 to-stone-900/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-transparent" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-6 py-2 text-xs font-medium tracking-[0.2em] text-amber-300 backdrop-blur-xl uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            New Collection 2025
          </span>
        </motion.div>

        <motion.h1
          initial={prefersReduced ? {} : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading text-7xl font-bold leading-[1.05] text-white sm:text-8xl md:text-9xl lg:text-[8rem]"
        >
          Define Your
          <br />
          <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-transparent">
            Signature Style
          </span>
        </motion.h1>

        <motion.p
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 max-w-2xl text-lg text-stone-300/90 sm:text-xl leading-relaxed font-light"
        >
          Premium clothing, bags, and accessories crafted for those who
          appreciate quality and timeless design.
        </motion.p>

        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-wrap items-center justify-center gap-5"
        >
          <a
            href="#products"
            className="group inline-flex items-center gap-3 rounded-full btn-slide px-10 py-4.5 text-sm font-semibold text-white shadow-2xl shadow-amber-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/50 hover:scale-105 active:scale-100 tracking-wider uppercase"
          >
            Shop Now
            <ArrowRight
              size={16}
              className="transition-all duration-300 group-hover:translate-x-1.5"
            />
          </a>
          <a
            href="#categories"
            className="group inline-flex items-center gap-2 rounded-full border border-stone-400/30 px-10 py-4.5 text-sm font-semibold text-stone-200 backdrop-blur-md transition-all duration-500 hover:bg-white/10 hover:border-stone-300/50 active:scale-95 tracking-wider uppercase"
          >
            Explore
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={prefersReduced ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={prefersReduced ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-[10px] font-medium tracking-[0.25em] text-stone-400 uppercase">
            Scroll
          </span>
          <div className="h-14 w-[2px] overflow-hidden rounded-full bg-stone-600/50">
            <motion.div
              animate={prefersReduced ? {} : { y: [0, 56, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-1/3 w-full rounded-full bg-gradient-to-b from-amber-400 to-amber-600"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
