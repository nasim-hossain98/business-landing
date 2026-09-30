import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "New product" };
export const dynamic = "force-dynamic";

/** /admin/products/new — create a catalogue entry. */
export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          aria-label="Back to products"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-700 text-stone-400 transition-colors hover:border-amber-500/60 hover:text-amber-300"
        >
          <ChevronLeft size={16} />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-amber-500">
            Catalogue
          </p>
          <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            New product
          </h1>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}
