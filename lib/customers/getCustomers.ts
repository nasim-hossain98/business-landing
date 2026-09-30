import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  rowToCustomer,
  type CustomerRow,
  type OrderRow,
} from "@/lib/db/mappers";
import {
  localGetCustomerById,
  localListCustomers,
} from "@/lib/db/local-store";
import type { CustomerRecord, OrderRecord } from "@/lib/db/types";
import { rowToOrder, type OrderItemRow } from "@/lib/db/mappers";

/* ------------------------------------------------------------------
   Customer aggregates are folded in TypeScript from the order history.
   For the order volumes a boutique store sees (thousands, not millions)
   this is simpler and cheaper than a materialised view. See README →
   "Recommended future improvements".
   ------------------------------------------------------------------ */

type AggregateRow = Pick<
  OrderRow,
  "customer_id" | "total_amount" | "order_status" | "created_at"
>;

function foldStats(
  customers: CustomerRow[],
  orders: AggregateRow[],
): CustomerRecord[] {
  const byCustomer = new Map<string, AggregateRow[]>();
  for (const order of orders) {
    if (!order.customer_id) continue;
    if (order.order_status === "cancelled" || order.order_status === "returned") {
      continue;
    }
    const list = byCustomer.get(order.customer_id) ?? [];
    list.push(order);
    byCustomer.set(order.customer_id, list);
  }

  return customers.map((row) => {
    const customer = rowToCustomer(row);
    const relevant = byCustomer.get(row.id) ?? [];
    return {
      ...customer,
      totalOrders: relevant.length,
      totalSpent: relevant.reduce(
        (sum, order) => sum + Number(order.total_amount ?? 0),
        0,
      ),
      lastOrderAt: relevant.length
        ? relevant
            .map((order) => order.created_at)
            .sort((a, b) => b.localeCompare(a))[0]
        : null,
    };
  });
}

export async function getCustomers(search?: string): Promise<CustomerRecord[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return localListCustomers(search);

  try {
    let builder = supabase.from("customers").select("*").order("created_at", {
      ascending: false,
    });
    const term = search?.replace(/[%,]/g, " ").trim();
    if (term) {
      builder = builder.or(
        `name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`,
      );
    }

    const [{ data: customerRows, error: customerError }, { data: orderRows }] =
      await Promise.all([
        builder,
        supabase
          .from("orders")
          .select("customer_id,total_amount,order_status,created_at"),
      ]);

    if (customerError) throw customerError;

    return foldStats(
      (customerRows ?? []) as unknown as CustomerRow[],
      (orderRows ?? []) as unknown as AggregateRow[],
    ).sort((a, b) => (b.lastOrderAt ?? b.createdAt).localeCompare(a.lastOrderAt ?? a.createdAt));
  } catch (error) {
    console.error("[customers] Supabase query failed — using local store:", error);
    return localListCustomers(search);
  }
}

export async function getCustomerWithOrders(
  id: string,
): Promise<{ customer: CustomerRecord; orders: OrderRecord[] } | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return localGetCustomerById(id);

  try {
    const { data: customerRow, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!customerRow) return null;

    const { data: orderRows, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("customer_id", id)
      .order("created_at", { ascending: false });

    if (orderError) throw orderError;

    const rows = (orderRows ?? []) as unknown as Array<
      OrderRow & { order_items?: OrderItemRow[] | null }
    >;
    const orders = rows.map((row) => rowToOrder(row, row.order_items ?? []));
    const stats = foldStats([customerRow as unknown as CustomerRow], orders.map((order) => ({
      customer_id: order.customerId,
      total_amount: order.totalAmount,
      order_status: order.orderStatus,
      created_at: order.createdAt,
    })));

    return { customer: stats[0], orders };
  } catch (error) {
    console.error("[customers] Supabase query failed — using local store:", error);
    return localGetCustomerById(id);
  }
}
