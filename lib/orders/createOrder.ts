import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { calcTotals } from "@/lib/pricing";
import { formatOrderNumber, highestSequence, orderNumberPrefix } from "@/lib/order-number";
import {
  rowToOrder,
  rowToOrderItem,
  rowToStoreProduct,
  type OrderItemRow,
  type OrderRow,
  type ProductRow,
} from "@/lib/db/mappers";
import {
  localDecrementStock,
  localGetProductsByIds,
  localInsertOrder,
  localNextOrderNumber,
  localRestoreStock,
  localUpsertCustomer,
  type LocalOrderDraft,
} from "@/lib/db/local-store";
import type { NewOrderInput, OrderRecord } from "@/lib/db/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { phoneKey } from "@/lib/validation";
import type { StoreProduct } from "@/lib/products/types";

/* ------------------------------------------------------------------
   SERVER-SIDE ORDER CREATION  (the only trusted pricing path)

   The browser sends product ids + quantities only. Everything that
   affects money or availability is derived here, from the database:
     1. fetch products           6. compute shipping + total
     2. verify they exist        7. upsert customer
     3. verify they are active   8. insert order + order_items
     4. verify stock             9. decrement stock (rollback on conflict)
     5. read the current price  10. return the authoritative order
   ------------------------------------------------------------------ */

export class OrderError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "OrderError";
    this.status = status;
  }
}

type RequestedLine = {
  productId: string;
  quantity: number;
  selectedOption: string | null;
};

type PricedLine = RequestedLine & {
  product: StoreProduct;
  unitPrice: number;
  subtotal: number;
};

/** Collapses duplicate cart lines (same product + same option). */
function mergeLines(items: NewOrderInput["items"]): RequestedLine[] {
  const merged = new Map<string, RequestedLine>();
  for (const item of items) {
    const key = `${item.productId}::${item.selectedOption ?? ""}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity = Math.min(50, existing.quantity + item.quantity);
    } else {
      merged.set(key, {
        productId: item.productId,
        quantity: item.quantity,
        selectedOption: item.selectedOption ?? null,
      });
    }
  }
  return [...merged.values()];
}

async function loadProducts(ids: string[]): Promise<StoreProduct[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return localGetProductsByIds(ids);

  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,slug,description,price,compare_at_price,category,image_url,gallery_images,stock_quantity,sku,status,badge,features,options,rating,review_count,created_at,updated_at",
    )
    .in("id", ids);

  if (error) throw new OrderError("Could not verify the products in your cart.", 500);

  return ((data ?? []) as unknown as ProductRow[]).map(rowToStoreProduct);
}

/** Validates availability and prices every line from database values. */
function buildPricedLines(
  lines: RequestedLine[],
  products: StoreProduct[],
): PricedLine[] {
  const byId = new Map(products.map((product) => [product.id, product]));

  return lines.map((line) => {
    const product = byId.get(line.productId);
    if (!product) {
      throw new OrderError(
        "One of the items in your cart is no longer available.",
        409,
      );
    }
    if (product.status !== "active") {
      throw new OrderError(`"${product.name}" is not available right now.`, 409);
    }
    if (product.stockQuantity < line.quantity) {
      throw new OrderError(
        product.stockQuantity > 0
          ? `Only ${product.stockQuantity} left of "${product.name}".`
          : `"${product.name}" is out of stock.`,
        409,
      );
    }

    return {
      ...line,
      product,
      unitPrice: product.price,
      subtotal: Math.round(product.price * line.quantity * 100) / 100,
    };
  });
}

/* ------------------------------------------------------------------
   Supabase helpers
   ------------------------------------------------------------------ */

async function upsertCustomer(
  supabase: SupabaseClient,
  customer: NewOrderInput["customer"],
): Promise<string | null> {
  const { data, error } = await supabase
    .from("customers")
    .upsert(
      {
        phone: phoneKey(customer.phone),
        name: customer.fullName,
        email: customer.email || null,
        address: customer.address,
        city: customer.city,
        postal_code: customer.postalCode,
      },
      { onConflict: "phone" },
    )
    .select("id")
    .single();

  if (error || !data) {
    // A customer record is a convenience, never a reason to lose an order.
    console.error("[orders] customer upsert failed:", error?.message);
    return null;
  }
  return (data as { id: string }).id;
}

/**
 * Atomically removes stock.
 *
 * Prefers the `decrement_product_stock` SQL function (a single conditional
 * UPDATE). Falls back to an optimistic compare-and-swap when the function has
 * not been deployed yet, so no order can ever oversell.
 */
async function decrementStock(
  supabase: SupabaseClient,
  productId: string,
  quantity: number,
): Promise<boolean> {
  const rpc = await supabase.rpc("decrement_product_stock", {
    p_product_id: productId,
    p_quantity: quantity,
  });
  if (!rpc.error) return rpc.data === true;

  const { data: current } = await supabase
    .from("products")
    .select("stock_quantity")
    .eq("id", productId)
    .maybeSingle();

  const stock = Number(
    (current as { stock_quantity?: number } | null)?.stock_quantity ?? -1,
  );
  if (stock < quantity) return false;

  const { data: updated } = await supabase
    .from("products")
    .update({ stock_quantity: stock - quantity })
    .eq("id", productId)
    .eq("stock_quantity", stock)
    .select("id");

  return Array.isArray(updated) && updated.length > 0;
}

async function restoreStock(
  supabase: SupabaseClient,
  productId: string,
  quantity: number,
): Promise<void> {
  await supabase.rpc("increment_product_stock", {
    p_product_id: productId,
    p_quantity: quantity,
  });
}

async function nextOrderNumber(supabase: SupabaseClient): Promise<string> {
  const prefix = orderNumberPrefix();
  const { data } = await supabase
    .from("orders")
    .select("order_number")
    .like("order_number", `${prefix}-%`);

  const sequence =
    highestSequence(
      ((data ?? []) as { order_number: string }[]).map((row) => row.order_number),
    ) + 1;

  return formatOrderNumber(sequence);
}

/* ------------------------------------------------------------------
   Public entry point
   ------------------------------------------------------------------ */

export async function createOrder(input: NewOrderInput): Promise<OrderRecord> {
  const lines = mergeLines(input.items);
  if (lines.length === 0) throw new OrderError("Your cart is empty.");

  const products = await loadProducts(lines.map((line) => line.productId));
  const priced = buildPricedLines(lines, products);

  const subtotal = priced.reduce((sum, line) => sum + line.subtotal, 0);
  const totals = calcTotals(subtotal);

  const supabase = createSupabaseAdminClient();

  /* ---------------- local development store ---------------- */
  if (!supabase) {
    const customer = localUpsertCustomer(input.customer);
    const draft: LocalOrderDraft = {
      orderNumber: localNextOrderNumber(),
      customerId: customer.id,
      customer: input.customer,
      subtotal: totals.subtotal,
      shippingCost: totals.shipping,
      totalAmount: totals.total,
      paymentMethod: input.paymentMethod,
      notes: input.notes ?? null,
      items: priced.map((line) => ({
        productId: line.product.id,
        productName: line.product.name,
        productSlug: line.product.slug,
        productImage: line.product.image,
        selectedOption: line.selectedOption,
        unitPrice: line.unitPrice,
        quantity: line.quantity,
        subtotal: line.subtotal,
      })),
    };

    const reserved: PricedLine[] = [];
    for (const line of priced) {
      if (!localDecrementStock(line.product.id, line.quantity)) {
        for (const done of reserved) {
          localRestoreStock(done.product.id, done.quantity);
        }
        throw new OrderError(`"${line.product.name}" just sold out.`, 409);
      }
      reserved.push(line);
    }

    return localInsertOrder(draft);
  }

  /* ---------------- Supabase ---------------- */
  const customerId = await upsertCustomer(supabase, input.customer);

  let orderNumber = await nextOrderNumber(supabase);
  let orderRow: OrderRow | null = null;

  for (let attempt = 0; attempt < 3 && !orderRow; attempt += 1) {
    const { data, error } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        customer_name: input.customer.fullName,
        customer_email: input.customer.email || null,
        customer_phone: input.customer.phone,
        shipping_address: input.customer.address,
        shipping_city: input.customer.city,
        shipping_postal_code: input.customer.postalCode,
        subtotal: totals.subtotal,
        shipping_cost: totals.shipping,
        total_amount: totals.total,
        payment_method: input.paymentMethod,
        payment_status: "unpaid",
        order_status: "pending",
        notes: input.notes ?? null,
      })
      .select("*")
      .single();

    if (!error && data) {
      orderRow = data as unknown as OrderRow;
      break;
    }
    if (error?.code === "23505") {
      // Two checkouts claimed the same sequence — take the next number.
      orderNumber = formatOrderNumber(highestSequence([orderNumber]) + 1);
      continue;
    }
    console.error("[orders] insert failed:", error?.message);
    throw new OrderError("We could not place your order. Please try again.", 500);
  }

  if (!orderRow) {
    throw new OrderError("We could not place your order. Please try again.", 500);
  }

  const { data: itemRows, error: itemError } = await supabase
    .from("order_items")
    .insert(
      priced.map((line) => ({
        order_id: orderRow.id,
        product_id: line.product.id,
        product_name: line.product.name,
        product_slug: line.product.slug,
        product_image: line.product.image,
        selected_option: line.selectedOption,
        product_price: line.unitPrice,
        quantity: line.quantity,
        subtotal: line.subtotal,
      })),
    )
    .select("*");

  if (itemError || !itemRows) {
    await supabase.from("orders").delete().eq("id", orderRow.id);
    throw new OrderError("We could not place your order. Please try again.", 500);
  }

  const reserved: PricedLine[] = [];
  for (const line of priced) {
    const ok = await decrementStock(supabase, line.product.id, line.quantity);
    if (!ok) {
      for (const done of reserved) {
        await restoreStock(supabase, done.product.id, done.quantity);
      }
      await supabase.from("orders").delete().eq("id", orderRow.id);
      throw new OrderError(`"${line.product.name}" just sold out.`, 409);
    }
    reserved.push(line);
  }

  return rowToOrder(orderRow, itemRows as unknown as OrderItemRow[]);
}

/** Re-exported so the order-success page can render a hydrated order. */
export { rowToOrderItem };

