"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

type Tilt3DProps = {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. */
  max?: number;
  /** Adds a subtle light glare that tracks the pointer. */
  glare?: boolean;
};

/**
 * Interactive 3D tilt. Tracks the pointer over the element and rotates it in
 * perspective with spring physics. Falls back to a static wrapper when the
 * user prefers reduced motion.
 */
export default function Tilt3D({
  children,
  className = "",
  max = 12,
  glare = true,
}: Tilt3DProps) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const springCfg = { stiffness: 220, damping: 20, mass: 0.4 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), springCfg);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), springCfg);

  const glareX = useTransform(px, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(py, [0, 1], ["0%", "100%"]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,240,210,0.35), transparent 55%)`;

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function reset() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <div ref={ref} className={`perspective-near ${className}`}>
      <motion.div
        onPointerMove={handleMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full w-full will-change-transform"
      >
        {children}
        {glare && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] mix-blend-soft-light"
            style={{ background: glareBg }}
          />
        )}
      </motion.div>
    </div>
  );
}
