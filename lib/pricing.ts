/* ------------------------------------------------------------------
   Shared pricing rules (used by BOTH the browser and the server)
   ------------------------------------------------------------------
   The cart UI uses these to preview a total, and `lib/orders/createOrder.ts`
   uses the exact same functions to compute the authoritative total. The client
   value is never trusted — it only exists so the customer sees no jump at
   checkout.
   ------------------------------------------------------------------ */

/** Flat delivery charge applied to orders below the free-shipping threshold. */
export const SHIPPING_COST = 9.99;

/** Order subtotal at (or above) which delivery is free. */
export const FREE_SHIPPING_THRESHOLD = 50;

export const PAYMENT_METHODS = ["cod", "bkash", "nagad"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
};

export type OrderTotals = {
  subtotal: number;
  shipping: number;
  total: number;
};

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calcShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal <= 0 ? 0 : SHIPPING_COST;
}

/** Subtotal + shipping. Tax is intentionally not modelled (see README). */
export function calcTotals(subtotal: number): OrderTotals {
  const safeSubtotal = round2(Math.max(0, subtotal));
  const shipping = calcShipping(safeSubtotal);
  return {
    subtotal: safeSubtotal,
    shipping,
    total: round2(safeSubtotal + shipping),
  };
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    (PAYMENT_METHODS as readonly string[]).includes(value)
  );
}
