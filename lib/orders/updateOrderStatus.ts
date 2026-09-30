import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rowToOrder, type OrderItemRow, type OrderRow } from "@/lib/db/mappers";
import { localUpdateOrderStatus } from "@/lib/db/local-store";
import type { OrderRecord, OrderStatus, PaymentStatus } from "@/lib/db/types";

/**
 * Admin mutation: move an order through its lifecycle.
 *
 * When an order is marked `delivered` and payment is still outstanding the
 * payment status is promoted to `paid` — the common case for cash on delivery.
 */
export async function updateOrderStatus(
  id: string,
  orderStatus: OrderStatus,
  paymentStatus?: PaymentStatus | null,
): Promise<OrderRecord | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return localUpdateOrderStatus(id, orderStatus, paymentStatus ?? undefined);
  }

  const patch: Record<string, unknown> = {
    order_status: orderStatus,
    updated_at: new Date().toISOString(),
  };
  if (paymentStatus) patch.payment_status = paymentStatus;

  let { data, error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", id)
    .select("*, order_items(*)")
    .maybeSingle();

  if (!error && data && orderStatus === "delivered" && !paymentStatus) {
    const row = data as unknown as OrderRow;
    if (row.payment_status === "unpaid") {
      const retry = await supabase
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("id", id)
        .select("*, order_items(*)")
        .maybeSingle();
      if (!retry.error && retry.data) {
        data = retry.data;
        error = null;
      }
    }
  }

  if (error) {
    console.error("[orders] status update failed:", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as unknown as OrderRow & {
    order_items?: OrderItemRow[] | null;
  };
  return rowToOrder(row, row.order_items ?? []);
}
