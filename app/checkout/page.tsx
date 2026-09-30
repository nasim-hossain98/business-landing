import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout — LUXE",
  description: "Complete your LUXE order. Cash on delivery available.",
};

/**
 * /checkout — public. No account required: the customer fills in delivery
 * details, the order is created server-side and an order number is returned.
 */
export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-white dark:bg-stone-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="py-6">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition-colors duration-300 hover:text-amber-500"
            >
              <ChevronLeft size={16} />
              Back to Cart
            </Link>
          </div>

          <AnimatedSection className="mb-10">
            <h1 className="font-heading text-4xl font-bold text-stone-900 dark:text-white sm:text-5xl">
              Checkout
            </h1>
            <p className="mt-2 text-stone-500 dark:text-stone-400">
              No account needed — just tell us where to deliver.
            </p>
          </AnimatedSection>

          <CheckoutForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
