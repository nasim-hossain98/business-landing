"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, useReducedMotion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { reviews } from "@/data/reviews";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function Reviews() {
  const prefersReduced = useReducedMotion();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", skipSnaps: false },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  return (
    <section
      id="reviews"
      className="py-28 sm:py-36 bg-cream-50 dark:bg-stone-950/80"
    >
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedSection className="text-center mb-18">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">
            Testimonials
          </p>
          <h2 className="mt-4 font-heading text-5xl font-bold text-stone-900 dark:text-white sm:text-6xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-base text-stone-500 dark:text-stone-400 leading-relaxed">
            Don&apos;t just take our word for it — hear from our community
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="relative">
            <div className="overflow-hidden -mx-2 px-2" ref={emblaRef}>
              <div className="flex gap-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-0"
                  >
                    <motion.div
                      whileHover={prefersReduced ? {} : { y: -6 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-3xl bg-white dark:bg-stone-800/80 p-10 shadow-sm border border-stone-100 dark:border-stone-700/50 transition-all duration-500 hover:shadow-xl hover:border-amber-200/50 dark:hover:border-amber-600/30"
                    >
                      <Quote
                        size={24}
                        className="text-amber-500/20 mb-6"
                        fill="currentColor"
                      />
                      <div className="flex gap-1 mb-5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            size={14}
                            className={
                              j < review.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-stone-300 dark:text-stone-600"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8 text-[15px]">
                        &ldquo;{review.quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-white shadow-md">
                          {review.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900 dark:text-white text-sm">
                            {review.name}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            Verified Buyer
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={scrollPrev}
                aria-label="Previous review"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 transition-all duration-300 hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/25 active:scale-90"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next review"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 transition-all duration-300 hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/25 active:scale-90"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
