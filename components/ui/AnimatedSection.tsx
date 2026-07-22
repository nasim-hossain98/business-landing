"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
};

const directionOffset = {
  up: { y: 50, x: 0 },
  down: { y: -50, x: 0 },
  left: { x: -50, y: 0 },
  right: { x: 50, y: 0 },
  scale: { x: 0, y: 0 },
};

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: AnimatedSectionProps) {
  const prefersReduced = useReducedMotion();

  const offset = directionOffset[direction];

  return (
    <motion.div
      className={className}
      initial={
        prefersReduced
          ? { opacity: 1 }
          : {
              opacity: 0,
              x: offset.x,
              y: offset.y,
              scale: direction === "scale" ? 0.9 : 1,
            }
      }
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
