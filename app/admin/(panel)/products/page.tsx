import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Search, Boxes } from "lucide-react";
import ProductsTable from "@/components/admin/ProductsTable";
import { getProducts, countProducts } from "@/lib/products/getProducts";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/products/types";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

const field =
  "w-full rounded-xl border border-stone-700 bg-stone-800 px-3.5 py-2.5 text-sm text-white placeholder-stone-500 outline-none transition-colors focus:border-amber-500";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const search = await searchParams;
  const category = PRODUCT_CATEGORIES.includes(
    search.category as ProductCategory,
  )
    ? (search.category as ProductCategory)
    : undefined;

  const [products, total] = await Promise.all([
    getProducts({
      includeInactive: true,
      search: search.q || undefined,
      category,
      limit: 200,
    }),
    countProducts({ includeInactive: true, category }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-amber-500">
            Catalogue
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-white">
            Products
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            {total} product{total === 1 ? "" : "s"} · {products.length} shown
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-950 transition-all hover:shadow-lg hover:shadow-amber-500/20"
        >
          <Plus size={15} />
          Add product
        </Link>
      </div>

      <form
        method="get"
        action="/admin/products"
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
          />
          <input
            type="search"
            name="q"
            defaultValue={search.q ?? ""}
            placeholder="Search name, description or SKU"
            className={`${field} pl-10`}
          />
        </div>
        <select name="category" defaultValue={search.category ?? ""} className="sm:w-56">
          <option value="">All categories</option>
          {PRODUCT_CATEGORIES.map((value) => (
            <option key={value} value={value} className="capitalize">
              {value}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl border border-stone-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-300 transition-colors hover:border-amber-500/60 hover:text-amber-300"
        >
          Filter
        </button>
      </form>

      <ProductsTable products={products} />

      {products.length === 0 && (
        <p className="text-center text-xs text-stone-600">
          <Boxes size={13} className="mr-1.5 inline align-text-bottom" />
          Nothing here yet — add your first product.
        </p>
      )}
    </div>
  );
}
