"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, Quote } from "lucide-react";
import { reviews } from "@/data/reviews";

// Curated highlights for the stacked deck (all 5-star, varied products).
const FEATURED = [0, 3, 6, 4].map((i) => reviews[i]);

const AVG = (
  reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
).toFixed(1);

export default function Reviews() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !rootRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".reviews-head > *", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".reviews-head", start: "top 85%" },
      });

      const cards = gsap.utils.toArray<HTMLElement>(".review-card");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        const inner = card.querySelector(".review-inner");
        // As the next card scrolls up to cover this one, it recedes in 3D.
        gsap.to(inner, {
          scale: 0.88,
          rotateX: 10,
          y: -40,
          opacity: 0.35,
          transformOrigin: "50% 0%",
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="reviews"
      ref={rootRef}
      className="relative bg-cream-50 dark:bg-stone-950"
    >
      <div className="reviews-head mx-auto max-w-3xl px-6 pt-28 text-center sm:pt-36">
        <h2 className="font-heading text-5xl font-bold leading-[1.05] tracking-tight text-stone-900 dark:text-white sm:text-6xl md:text-7xl">
          Loved by our <span className="italic text-amber-600">community</span>
        </h2>
        <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-5 py-2.5">
          <span className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className="fill-amber-500 text-amber-500" />
            ))}
          </span>
          <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
            {AVG}/5 · {reviews.length} verified reviews
          </span>
        </div>
      </div>

      <div className="relative mt-16">
        {FEATURED.map((review) => (
          <div
            key={review.id}
            className="review-card sticky top-0 flex min-h-[100dvh] items-center justify-center px-6 [perspective:1600px]"
          >
            <article className="review-inner preserve-3d relative w-full max-w-3xl rounded-[2rem] border border-stone-200/70 bg-white p-10 shadow-[0_40px_120px_-45px_rgba(28,25,23,0.5)] dark:border-stone-800 dark:bg-stone-900 sm:p-16">
              <Quote
                size={48}
                className="mb-8 text-amber-500/25"
                fill="currentColor"
              />
              <div className="mb-7 flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={18}
                    className={
                      j < review.rating
                        ? "fill-amber-500 text-amber-500"
                        : "text-stone-300 dark:text-stone-600"
                    }
                  />
                ))}
              </div>
              <p className="font-heading text-2xl font-medium leading-snug text-stone-900 dark:text-white sm:text-3xl md:text-4xl">
                &ldquo;{review.quote}&rdquo;
              </p>
              <div className="mt-10 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-base font-bold text-white shadow-lg">
                  {review.avatar}
                </div>
                <div>
                  <p className="font-semibold text-stone-900 dark:text-white">
                    {review.name}
                  </p>
                  <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                    on {review.product}
                  </p>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
