import Link from "next/link";
import Image from "next/image";
import { PackageSearch } from "lucide-react";
import ProductRowActions from "@/components/admin/ProductRowActions";
import { formatCurrency } from "@/lib/format";
import type { StoreProduct } from "@/lib/products/types";

const STATUS_STYLES: Record<StoreProduct["status"], string> = {
  active:
    "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
  draft:
    "bg-amber-500/10 text-amber-400 ring-amber-500/30",
  archived:
    "bg-stone-500/10 text-stone-400 ring-stone-500/30",
};

/** Catalogue table for `/admin/products` (server component). */
export default function ProductsTable({ products }: { products: StoreProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-700 px-6 py-14 text-center">
        <PackageSearch size={26} className="mx-auto mb-3 text-stone-600" />
        <p className="text-sm text-stone-400">No products found.</p>
        <p className="mt-1 text-xs text-stone-600">
          Add your first product to publish it on the storefront.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/60">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-800 text-[11px] uppercase tracking-[0.14em] text-stone-500">
              <th className="px-5 py-3.5 font-semibold">Product</th>
              <th className="px-5 py-3.5 font-semibold">Category</th>
              <th className="px-5 py-3.5 font-semibold">Price</th>
              <th className="px-5 py-3.5 font-semibold">Stock</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/70">
            {products.map((product) => (
              <tr
                key={product.id}
                className="transition-colors hover:bg-stone-800/40"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-stone-800">
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="block truncate font-medium text-white transition-colors hover:text-amber-300"
                      >
                        {product.name}
                      </Link>
                      <p className="truncate text-xs text-stone-500">
                        {product.sku ?? product.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 capitalize text-stone-400">
                  {product.category}
                </td>
                <td className="px-5 py-4 font-semibold text-white tabular-nums">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-5 py-4 tabular-nums">
                  <span
                    className={
                      product.stockQuantity <= 5
                        ? "font-semibold text-amber-400"
                        : "text-stone-300"
                    }
                  >
                    {product.stockQuantity}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 ${STATUS_STYLES[product.status]}`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <ProductRowActions product={product} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
