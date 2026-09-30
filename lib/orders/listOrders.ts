import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  rowToOrder,
  type OrderItemRow,
  type OrderRow,
} from "@/lib/db/mappers";
import { localListOrders } from "@/lib/db/local-store";
import type { OrderQuery, OrderQueryResult } from "@/lib/db/types";

/** Page size used by `/admin/orders` pagination. */
export const ADMIN_ORDERS_PAGE_SIZE = 12;

/* eslint-disable @typescript-eslint/no-explicit-any */
function applyOrderFilters(builder: any, query: OrderQuery) {
  let next = builder;
  if (query.status) next = next.eq("order_status", query.status);
  if (query.paymentStatus) {
    next = next.eq("payment_status", query.paymentStatus);
  }
  if (query.from) next = next.gte("created_at", `${query.from}T00:00:00.000Z`);
  if (query.to) next = next.lte("created_at", `${query.to}T23:59:59.999Z`);
  if (query.search) {
    const term = query.search.replace(/[%,]/g, " ").trim();
    if (term) {
      next = next.or(
        `order_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%,customer_email.ilike.%${term}%`,
      );
    }
  }
  return next;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Admin order list with server-side filtering, search and pagination. */
export async function listOrders(
  query: OrderQuery = {},
): Promise<OrderQueryResult> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return localListOrders(query);

  try {
    const offset = query.offset ?? 0;
    const limit = query.limit ?? ADMIN_ORDERS_PAGE_SIZE;

    const builder = applyOrderFilters(
      supabase.from("orders").select("*, order_items(*)", { count: "exact" }),
      query,
    ).order("created_at", { ascending: query.orderBy === "oldest" });

    const { data, error, count } = await builder.range(offset, offset + limit - 1);
    if (error) throw error;

    const rows = (data ?? []) as unknown as Array<
      OrderRow & { order_items?: OrderItemRow[] | null }
    >;

    return {
      orders: rows.map((row) => rowToOrder(row, row.order_items ?? [])),
      total: count ?? rows.length,
    };
  } catch (error) {
    console.error("[orders] Supabase list failed — using local store:", error);
    return localListOrders(query);
  }
}
