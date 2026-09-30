import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rowToStoreProduct, type ProductRow } from "@/lib/db/mappers";
import { localListProducts } from "@/lib/db/local-store";
import type { ProductQuery } from "@/lib/db/types";
import type { StoreProduct } from "@/lib/products/types";

/**
 * Columns selected from `products`. Explicit rather than `*` so the shape that
 * reaches the browser is always intentional.
 */
export const PRODUCT_COLUMNS =
  "id,name,slug,description,price,compare_at_price,category,image_url,gallery_images,stock_quantity,sku,status,badge,features,options,rating,review_count,created_at,updated_at";

/* eslint-disable @typescript-eslint/no-explicit-any */
function applyFilters(builder: any, query: ProductQuery) {
  let next = builder;
  if (!query.includeInactive) {
    next = next.eq("status", "active");
  }
  if (query.category) {
    next = next.eq("category", query.category);
  }
  if (query.search) {
    const term = query.search.replace(/[%,]/g, " ").trim();
    if (term) {
      next = next.or(
        `name.ilike.%${term}%,description.ilike.%${term}%,sku.ilike.%${term}%`,
      );
    }
  }
  return next;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function sortExpression(query: ProductQuery): { column: string; ascending: boolean } {
  switch (query.orderBy) {
    case "price-asc":
      return { column: "price", ascending: true };
    case "price-desc":
      return { column: "price", ascending: false };
    case "name":
      return { column: "name", ascending: true };
    default:
      return { column: "created_at", ascending: false };
  }
}

/** Storefront/admin product list. Falls back to the seed catalogue if needed. */
export async function getProducts(query: ProductQuery = {}): Promise<StoreProduct[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return localListProducts(query);

  try {
    const offset = query.offset ?? 0;
    const { column, ascending } = sortExpression(query);
    const builder = applyFilters(
      supabase.from("products").select(PRODUCT_COLUMNS),
      query,
    ).order(column, { ascending });

    const limit = query.limit ?? 200;
    const { data, error } = await builder.range(offset, offset + limit - 1);
    if (error) throw error;

    return ((data ?? []) as unknown as ProductRow[]).map(rowToStoreProduct);
  } catch (error) {
    console.error("[products] Supabase list failed — using local catalogue:", error);
    return localListProducts(query);
  }
}

/** Row count for pagination. */
export async function countProducts(query: ProductQuery = {}): Promise<number> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return localListProducts(query).length;

  try {
    const builder = applyFilters(
      supabase.from("products").select("id", { count: "exact", head: true }),
      query,
    );
    const { count, error } = await builder;
    if (error) throw error;
    return count ?? 0;
  } catch (error) {
    console.error("[products] Supabase count failed — using local catalogue:", error);
    return localListProducts(query).length;
  }
}
