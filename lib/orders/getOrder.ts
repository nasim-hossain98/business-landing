import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  rowToOrder,
  type OrderItemRow,
  type OrderRow,
} from "@/lib/db/mappers";
import {
  localFindOrderByNumber,
  localGetOrderById,
} from "@/lib/db/local-store";
import type { OrderRecord } from "@/lib/db/types";
import { phoneKey } from "@/lib/validation";
import type { PublicOrder } from "@/lib/db/client-types";

const ORDER_SELECT = "*, order_items(*)";

type OrderWithItems = OrderRow & { order_items?: OrderItemRow[] | null };

function hydrate(row: OrderWithItems): OrderRecord {
  return rowToOrder(row, row.order_items ?? []);
}

/** Lookup used by `/order-success/[orderNumber]`, `/track-order` and the API. */
export async function getOrderByNumber(
  orderNumber: string,
): Promise<OrderRecord | null> {
  const needle = orderNumber.trim().toUpperCase();
  if (!needle) return null;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return localFindOrderByNumber(needle);

  try {
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("order_number", needle)
      .maybeSingle();

    if (error) throw error;
    return data ? hydrate(data as unknown as OrderWithItems) : null;
  } catch (error) {
    console.error("[orders] Supabase lookup failed — using local store:", error);
    return localFindOrderByNumber(needle);
  }
}

export async function getOrderById(id: string): Promise<OrderRecord | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return localGetOrderById(id);

  try {
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? hydrate(data as unknown as OrderWithItems) : null;
  } catch (error) {
    console.error("[orders] Supabase lookup failed — using local store:", error);
    return localGetOrderById(id);
  }
}

/**
 * Customer-facing tracking lookup.
 *
 * Both the order number **and** the phone number on the order are required, so
 * knowing an order number alone reveals nothing. The phone comparison is done
 * after the fetch (digit-normalised) so formatting differences are tolerated.
 */
export async function findOrderForTracking(
  orderNumber: string,
  phone: string,
): Promise<OrderRecord | null> {
  const order = await getOrderByNumber(orderNumber);
  if (!order) return null;

  const provided = phoneKey(phone);
  if (!provided || provided !== phoneKey(order.customerPhone)) return null;

  return order;
}

/** Re-exported so client components can type the tracking payload. */
export type { PublicOrder } from "@/lib/db/client-types";

export function toPublicOrder(order: OrderRecord): PublicOrder {
  const nameParts = order.customerName.trim().split(/\s+/);
  return {
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    city: order.shippingCity,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customerLastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : "",
    items: order.items.map((item) => ({
      name: item.productName,
      slug: item.productSlug,
      image: item.productImage,
      option: item.selectedOption,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
  };
}
