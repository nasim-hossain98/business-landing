import "server-only";

import type { ProductCategory, ProductInput, StoreProduct } from "@/lib/products/types";
import type { PaymentMethod } from "@/lib/pricing";
import type { OrderStatus, PaymentStatus } from "@/lib/db/statuses";

/** Re-exported so server files can keep importing statuses from here. */
export type { OrderStatus, PaymentStatus };
export { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/db/statuses";

/* ------------------------------------------------------------------
   Store-facing aggregates used by server components and API routes.
   (For types that must render in the browser see `lib/db/statuses.ts`.)
   ------------------------------------------------------------------ */

export type OrderItemRecord = {
  id: string;
  orderId: string;
  productId: string | null;
  productName: string;
  productSlug: string | null;
  productImage: string | null;
  selectedOption: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: string;
};

export type OrderRecord = {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemRecord[];
};

export type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  createdAt: string;
  updatedAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
};

/* ------------------------------------------------------------------
   Query options
   ------------------------------------------------------------------ */

export type ProductQuery = {
  category?: ProductCategory;
  search?: string;
  /** Admin views include draft/archived products. Defaults to `false`. */
  includeInactive?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: "newest" | "price-asc" | "price-desc" | "name";
};

export type OrderQuery = {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  /** Free-text search across order number, customer name, phone, email. */
  search?: string;
  /** Inclusive ISO date bounds (YYYY-MM-DD). */
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
  orderBy?: "newest" | "oldest";
};

export type OrderQueryResult = {
  orders: OrderRecord[];
  total: number;
};

/** Raw payload accepted by the public checkout endpoint. */
export type NewOrderItemInput = {
  productId: string;
  quantity: number;
  selectedOption?: string | null;
};

export type NewOrderInput = {
  items: NewOrderItemInput[];
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  paymentMethod: PaymentMethod;
  notes?: string | null;
};

export type { ProductInput, StoreProduct };
