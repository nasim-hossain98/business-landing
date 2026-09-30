import "server-only";

import type { ProductOption, StoreProduct } from "@/lib/products/types";
import type {
  CustomerRecord,
  OrderItemRecord,
  OrderRecord,
  OrderStatus,
  PaymentStatus,
} from "@/lib/db/types";
import { isPaymentMethod, type PaymentMethod } from "@/lib/pricing";

/* ------------------------------------------------------------------
   products table ⇄ storefront product
   ------------------------------------------------------------------ */

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  category: string;
  image_url: string | null;
  gallery_images: string[] | null;
  stock_quantity: number | null;
  sku: string | null;
  status: string;
  badge: string | null;
  features: string[] | null;
  options: unknown;
  rating: number | string | null;
  review_count: number | null;
  created_at: string;
  updated_at: string;
};

function num(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseOptions(value: unknown): ProductOption[] {
  if (!Array.isArray(value)) return [];
  const options: ProductOption[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const label = (entry as { label?: unknown }).label;
    const values = (entry as { values?: unknown }).values;
    if (typeof label !== "string" || !Array.isArray(values)) continue;
    options.push({
      label,
      values: values.filter((v): v is string => typeof v === "string"),
    });
  }
  return options.filter((option) => option.values.length > 0);
}

export function rowToStoreProduct(row: ProductRow): StoreProduct {
  const options = parseOptions(row.options);
  const product: StoreProduct = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: num(row.price),
    compareAtPrice:
      row.compare_at_price === null || row.compare_at_price === undefined
        ? null
        : num(row.compare_at_price),
    category: (row.category ?? "others") as StoreProduct["category"],
    image: row.image_url ?? "/images/product-1.jpg",
    galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
    description: row.description ?? "",
    features: Array.isArray(row.features) ? row.features : [],
    rating: num(row.rating, 5),
    reviewCount: num(row.review_count, 0),
    options:
      options.length > 0 ? options : [{ label: "Option", values: ["Standard"] }],
    stockQuantity: num(row.stock_quantity, 0),
    sku: row.sku,
    status: (row.status ?? "active") as StoreProduct["status"],
  };
  if (row.badge) product.badge = row.badge;
  return product;
}

/* ------------------------------------------------------------------
   orders + order_items → order aggregate
   ------------------------------------------------------------------ */

export type OrderRow = {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  subtotal: number | string;
  shipping_cost: number | string;
  total_amount: number | string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  product_image: string | null;
  selected_option: string | null;
  product_price: number | string;
  quantity: number;
  subtotal: number | string;
  created_at: string;
};

export function rowToOrderItem(row: OrderItemRow): OrderItemRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productName: row.product_name,
    productSlug: row.product_slug,
    productImage: row.product_image,
    selectedOption: row.selected_option,
    unitPrice: num(row.product_price),
    quantity: num(row.quantity, 1),
    subtotal: num(row.subtotal),
    createdAt: row.created_at,
  };
}

export function rowToOrder(row: OrderRow, items: OrderItemRow[]): OrderRecord {
  const paymentMethod: PaymentMethod = isPaymentMethod(row.payment_method)
    ? row.payment_method
    : "cod";

  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email ?? "",
    customerPhone: row.customer_phone,
    shippingAddress: row.shipping_address ?? "",
    shippingCity: row.shipping_city ?? "",
    shippingPostalCode: row.shipping_postal_code ?? "",
    subtotal: num(row.subtotal),
    shippingCost: num(row.shipping_cost),
    totalAmount: num(row.total_amount),
    paymentMethod,
    paymentStatus: row.payment_status as PaymentStatus,
    orderStatus: row.order_status as OrderStatus,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items.map(rowToOrderItem),
  };
}

export type CustomerRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  created_at: string;
  updated_at: string;
  total_orders?: number | string | null;
  total_spent?: number | string | null;
  last_order_at?: string | null;
};

export function rowToCustomer(row: CustomerRow): CustomerRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone,
    address: row.address ?? "",
    city: row.city ?? "",
    postalCode: row.postal_code ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totalOrders: num(row.total_orders, 0),
    totalSpent: num(row.total_spent, 0),
    lastOrderAt: row.last_order_at ?? null,
  };
}
