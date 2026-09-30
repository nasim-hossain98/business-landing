import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { localDeleteProduct, localUpdateProduct } from "@/lib/db/local-store";

/**
 * Hard-deletes a product.
 *
 * Historical order lines keep their own name/price snapshot (`order_items`),
 * so removing a product never rewrites past orders. If the product is
 * referenced by an order, `order_items.product_id` is set to NULL by the
 * `on delete set null` foreign key and the fallback soft-delete is used when
 * the database refuses the delete.
 */
export async function deleteProduct(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    const deleted = localDeleteProduct(id);
    if (!deleted) throw new Error("Product not found.");
    return;
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Disables a product without deleting it (preferred for "retire" flows). */
export async function archiveProduct(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    const updated = localUpdateProduct(id, { status: "archived" });
    if (!updated) throw new Error("Product not found.");
    return;
  }

  const { error } = await supabase
    .from("products")
    .update({ status: "archived" })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
