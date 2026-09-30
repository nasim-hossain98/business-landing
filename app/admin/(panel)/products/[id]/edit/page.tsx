import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, ExternalLink } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/products/getProduct";

export const metadata: Metadata = { title: "Edit product" };
export const dynamic = "force-dynamic";

/** /admin/products/[id]/edit */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
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
              Editing
            </p>
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              {product.name}
            </h1>
          </div>
        </div>

        <Link
          href={`/product/${product.slug || product.id}`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-full border border-stone-700 px-4 py-2 text-xs font-medium text-stone-300 transition-colors hover:border-amber-500/60 hover:text-amber-300"
        >
          <ExternalLink size={13} />
          View on storefront
        </Link>
      </div>

      <ProductForm product={product} />
    </div>
  );
}
