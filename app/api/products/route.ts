import { NextResponse } from "next/server";

import { getProducts } from "@/lib/products/getProducts";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/products/types";
import { asInt, asString } from "@/lib/validation";

/**
 * GET /api/products — public catalogue endpoint.
 *
 * Returns only public (never admin-only) fields, and never draft or archived
 * products. Used by client-side filtering and available to any third party
 * that wants to display the catalogue.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryParam = asString(url.searchParams.get("category"));
  const search = asString(url.searchParams.get("q")) || undefined;
  const limit = Math.min(Math.max(asInt(url.searchParams.get("limit")) ?? 40, 1), 100);
  const offset = Math.max(asInt(url.searchParams.get("offset")) ?? 0, 0);

  const category = PRODUCT_CATEGORIES.includes(categoryParam as ProductCategory)
    ? (categoryParam as ProductCategory)
    : undefined;

  const products = await getProducts({ category, search, limit, offset });

  return NextResponse.json({
    products,
    count: products.length,
    limit,
    offset,
  });
}
