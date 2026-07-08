"use client";

import { Shield, Truck, RotateCcw, CreditCard, ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

/* ------------------------------------------------------------------ */
/*  Inline SVG payment logos — no external images needed               */
/* ------------------------------------------------------------------ */

function VisaLogo() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-auto" aria-label="Visa">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-auto" aria-label="Mastercard">
      <rect width="48" height="32" rx="4" fill="#2D2D2D" />
      <circle cx="20" cy="16" r="8" fill="#EB001B" />
      <circle cx="28" cy="16" r="8" fill="#F79E1B" />
      <path
        d="M24 10.3a8 8 0 0 1 0 11.4 8 8 0 0 1 0-11.4z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function PayPalLogo() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-auto" aria-label="PayPal">
      <rect width="48" height="32" rx="4" fill="#003087" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        PayPal
      </text>
    </svg>
  );
}

function StripeLogo() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-auto" aria-label="Stripe">
      <rect width="48" height="32" rx="4" fill="#635BFF" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        Stripe
      </text>
    </svg>
  );
}

const trustBadges = [
  {
    icon: Shield,
    title: "Secure Checkout",
    description: "256-bit SSL encryption",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $50",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day money back guarantee",
  },
  {
    icon: CreditCard,
    title: "Flexible Payment",
    description: "All major cards accepted",
  },
];

/**
 * TrustSection — payment method logos, trust badges, and a CTA.
 * Builds customer confidence before checkout.
 */
export default function TrustSection() {
  return (
    <section className="py-24 sm:py-32 bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6">
        {/* Trust badges grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-20">
          {trustBadges.map((badge, i) => (
            <AnimatedSection key={badge.title} delay={i * 0.1}>
              <div className="group text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-500/25 group-hover:scale-110">
                  <badge.icon size={28} />
                </div>
                <h3 className="font-heading text-lg font-semibold text-zinc-900 dark:text-white">
                  {badge.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {badge.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Payment logos + CTA */}
        <AnimatedSection>
          <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 p-12 sm:p-16 text-center">
            <h3 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Ready to Upgrade Your Style?
            </h3>
            <p className="mt-4 mx-auto max-w-xl text-zinc-400">
              Join thousands of satisfied customers who trust us for premium
              quality fashion and accessories.
            </p>

            <a
              href="#products"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 active:scale-100"
            >
              Start Shopping
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>

            {/* Payment logos */}
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <span className="text-sm text-zinc-500 mr-2">We accept:</span>
              <VisaLogo />
              <MastercardLogo />
              <PayPalLogo />
              <StripeLogo />
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
