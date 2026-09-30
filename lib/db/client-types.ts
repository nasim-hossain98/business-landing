/* ------------------------------------------------------------------
   Client-safe order projections + analytics point types.
   ------------------------------------------------------------------ */

import type { OrderStatus, PaymentStatus } from "@/lib/db/statuses";
import type { PaymentMethod } from "@/lib/pricing";

/**
 * Public-safe order projection — everything `/track-order`, `/order-success`
 * and the public API may render. Phone numbers, emails and full addresses are
 * deliberately absent.
 */
export type PublicOrder = {
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  city: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customerLastName: string;
  items: Array<{
    name: string;
    slug: string | null;
    image: string | null;
    option: string | null;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
};

export type RevenuePoint = { date: string; revenue: number; orders: number };

export type BestSeller = {
  productId: string | null;
  name: string;
  quantity: number;
  revenue: number;
};

export type PaymentSplit = {
  method: PaymentMethod;
  count: number;
  revenue: number;
};
