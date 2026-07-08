"use client";

import { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, useReducedMotion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { reviews } from "@/data/reviews";
import AnimatedSection from "@/components/ui/AnimatedSection";

/**
 * Reviews — auto-scrolling testimonial carousel built with Embla.
 * Star ratings, avatar initials, customer name, and quote.
 */
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
      className="py-24 sm:py-32 bg-zinc-50 dark:bg-zinc-900/50"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <AnimatedSection className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
            Testimonials
          </p>
          <h2 className="mt-2 font-heading text-4xl font-bold text-zinc-900 dark:text-white sm:text-5xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
            Don&apos;t just take our word for it — hear from our community
          </p>
        </AnimatedSection>

        {/* Carousel */}
        <AnimatedSection delay={0.2}>
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                  >
                    <div className="h-full rounded-2xl bg-white dark:bg-zinc-800/80 p-8 shadow-sm border border-zinc-100 dark:border-zinc-700/50 transition-shadow duration-300 hover:shadow-lg">
                      {/* Quote icon */}
                      <Quote
                        size={32}
                        className="text-amber-500/20 mb-4"
                        fill="currentColor"
                      />

                      {/* Stars */}
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            size={16}
                            className={
                              j < review.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-zinc-300 dark:text-zinc-600"
                            }
                          />
                        ))}
                      </div>

                      {/* Quote text */}
                      <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                        &ldquo;{review.quote}&rdquo;
                      </p>

                      {/* Customer info */}
                      <div className="flex items-center gap-3">
                        {/* Avatar with initials */}
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-white shadow-md">
                          {review.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {review.name}
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Verified Buyer
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation arrows */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={scrollPrev}
                aria-label="Previous review"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-all duration-300 hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/25 active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next review"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-all duration-300 hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/25 active:scale-95"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
