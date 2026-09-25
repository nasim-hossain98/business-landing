"use client";

import dynamic from "next/dynamic";
import type { MotionValue } from "framer-motion";

// WebGL scene is client-only (needs the DOM/canvas) and lazy-loaded so the
// heavy three.js bundle never blocks first paint.
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => null,
});

export default function HeroCanvas({
  scrollProgress,
  reducedMotion,
}: {
  scrollProgress?: MotionValue<number>;
  reducedMotion?: boolean;
}) {
  return <HeroScene scrollProgress={scrollProgress} reducedMotion={reducedMotion} />;
}
