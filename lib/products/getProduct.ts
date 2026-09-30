import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rowToStoreProduct, type ProductRow } from "@/lib/db/mappers";
import { localFindProduct, localGetProductById } from "@/lib/db/local-store";
import { PRODUCT_COLUMNS } from "@/lib/products/getProducts";
import type { StoreProduct } from "@/lib/products/types";

/**
 * Public `/product/[id]` lookup.
 *
 * The URL segment accepts **both** the canonical slug and the legacy numeric
 * id, so previously shared links keep working.
 */
export async function getProductBySlugOrId(
  idOrSlug: string,
  options: { includeInactive?: boolean } = {},
): Promise<StoreProduct | null> {
  const needle = decodeURIComponent(idOrSlug).trim();
  if (!needle) return null;

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    const local = localFindProduct(needle);
    if (!local) return null;
    if (!options.includeInactive && local.status !== "active") return null;
    return local;
  }

  try {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(needle);

    let builder = supabase.from("products").select(PRODUCT_COLUMNS);
    if (!options.includeInactive) builder = builder.eq("status", "active");

    const { data, error } = await builder.or(
      `slug.eq.${needle}${isUuid ? `,id.eq.${needle}` : ""}`,
    ).limit(1);

    if (error) throw error;
    const row = (data ?? [])[0] as unknown as ProductRow | undefined;
    return row ? rowToStoreProduct(row) : null;
  } catch (error) {
    console.error("[products] Supabase lookup failed — using local catalogue:", error);
    return localFindProduct(needle);
  }
}

/** Admin lookup by primary key (includes draft/archived products). */
export async function getProductById(id: string): Promise<StoreProduct | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return localGetProductById(id);

  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? rowToStoreProduct(data as unknown as ProductRow) : null;
  } catch (error) {
    console.error("[products] Supabase lookup failed — using local catalogue:", error);
    return localGetProductById(id);
  }
}
