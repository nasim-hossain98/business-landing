"use client";

import { Shield, Truck, RotateCcw, CreditCard, ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

function VisaLogo() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-auto" aria-label="Visa">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">VISA</text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-auto" aria-label="Mastercard">
      <rect width="48" height="32" rx="4" fill="#2D2D2D" />
      <circle cx="20" cy="16" r="8" fill="#EB001B" />
      <circle cx="28" cy="16" r="8" fill="#F79E1B" />
      <path d="M24 10.3a8 8 0 0 1 0 11.4 8 8 0 0 1 0-11.4z" fill="#FF5F00" />
    </svg>
  );
}

function PayPalLogo() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-auto" aria-label="PayPal">
      <rect width="48" height="32" rx="4" fill="#003087" />
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">PayPal</text>
    </svg>
  );
}

function StripeLogo() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-auto" aria-label="Stripe">
      <rect width="48" height="32" rx="4" fill="#635BFF" />
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Stripe</text>
    </svg>
  );
}

const trustBadges = [
  { icon: Shield, title: "Secure Checkout", description: "256-bit SSL encryption" },
  { icon: Truck, title: "Free Shipping", description: "On orders over $50" },
  { icon: RotateCcw, title: "Easy Returns", description: "30-day money back guarantee" },
  { icon: CreditCard, title: "Flexible Payment", description: "All major cards accepted" },
];

export default function TrustSection() {
  return (
    <section className="py-28 sm:py-36 bg-white dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-24">
          {trustBadges.map((badge, i) => (
            <AnimatedSection key={badge.title} delay={i * 0.1} direction="up">
              <div className="group text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-amber-400 group-hover:to-amber-600 group-hover:text-white group-hover:shadow-2xl group-hover:shadow-amber-500/30 group-hover:scale-110 group-hover:-translate-y-1">
                  <badge.icon size={26} />
                </div>
                <h3 className="font-heading text-xl font-semibold text-stone-900 dark:text-white">
                  {badge.title}
                </h3>
                <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
                  {badge.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection direction="scale">
          <div className="relative rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 dark:from-stone-800 dark:via-stone-900 dark:to-stone-800 p-14 sm:p-18 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,119,6,0.12),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.06),transparent_50%)]" />
            <div className="relative z-10">
              <h3 className="font-heading text-4xl font-bold text-white sm:text-5xl">
                Ready to Upgrade Your Style?
              </h3>
              <p className="mt-4 mx-auto max-w-xl text-stone-400 text-base leading-relaxed">
                Join thousands of satisfied customers who trust us for premium quality fashion and accessories.
              </p>
              <a
                href="#products"
                className="group mt-8 inline-flex items-center gap-3 rounded-full btn-slide px-10 py-4.5 text-sm font-semibold text-white shadow-2xl shadow-amber-500/25 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-105 active:scale-100 tracking-wider uppercase"
              >
                Start Shopping
                <ArrowRight
                  size={16}
                  className="transition-all duration-300 group-hover:translate-x-1.5"
                />
              </a>
              <div className="mt-10 flex items-center justify-center gap-5 flex-wrap">
                <span className="text-sm text-stone-500 mr-2">We accept:</span>
                <VisaLogo />
                <MastercardLogo />
                <PayPalLogo />
                <StripeLogo />
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
