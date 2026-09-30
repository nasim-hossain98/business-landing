import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, PackageSearch } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import TrackOrderForm from "@/components/track-order/TrackOrderForm";

export const metadata: Metadata = {
  title: "Track Order — LUXE",
  description: "Check the status of your LUXE order using your order number and phone.",
};

/**
 * /track-order — public, and deliberately minimal.
 *
 * Nothing is rendered until the customer supplies a valid order number *and*
 * phone pair; the response never includes another customer's details.
 */
export default function TrackOrderPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-white dark:bg-stone-950">
        <div className="mx-auto max-w-5xl px-6">
          <div className="py-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition-colors duration-300 hover:text-amber-500"
            >
              <ChevronLeft size={16} />
              Back to Home
            </Link>
          </div>

          <AnimatedSection className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-500">
              Delivery
            </p>
            <h1 className="mt-4 font-heading text-4xl font-bold text-stone-900 dark:text-white sm:text-5xl">
              Track Your Order
            </h1>
            <p className="mt-3 flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <PackageSearch size={16} className="text-amber-500" />
              Enter your order number and phone number to see the latest status.
            </p>
          </AnimatedSection>

          <TrackOrderForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
