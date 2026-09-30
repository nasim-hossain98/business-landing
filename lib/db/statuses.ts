/* ------------------------------------------------------------------
   Order lifecycle vocabularies — browser-safe.
   ------------------------------------------------------------------ */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "unpaid",
  "paid",
  "refunded",
  "failed",
];

/** Customer-facing milestone ladder shown by the order timeline. */
export const TIMELINE_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
] as const;

export type TimelineStatus = (typeof TIMELINE_STATUSES)[number];
