import "server-only";

import { revalidatePath } from "next/cache";

/**
 * Called after an admin mutation so the storefront reflects the change
 * immediately instead of waiting for the ISR window to expire.
 */
export function revalidateStorefront(): void {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/product/[id]", "page");
}

/** Order visibility: the public tracking/success views for that order. */
export function revalidateOrderViews(orderNumber: string): void {
  revalidatePath(`/order-success/${orderNumber}`);
  revalidatePath("/track-order");
  revalidatePath("/admin/orders");
}
