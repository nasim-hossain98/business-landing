import "server-only";

import { products as seedProducts } from "@/data/products";
import { formatOrderNumber, highestSequence } from "@/lib/order-number";
import type {
  CustomerRecord,
  NewOrderInput,
  OrderItemRecord,
  OrderQuery,
  OrderQueryResult,
  OrderRecord,
  OrderStatus,
  PaymentStatus,
  ProductQuery,
} from "@/lib/db/types";
import type { ProductInput, StoreProduct } from "@/lib/products/types";

/* ------------------------------------------------------------------
   LOCAL DEVELOPMENT STORE  (no Supabase credentials required)
   ------------------------------------------------------------------
   In-memory persistence used whenever NEXT_PUBLIC_SUPABASE_URL /
   NEXT_PUBLIC_SUPABASE_ANON_KEY are missing. It exists so that the entire
   flow — catalogue → cart → checkout → order number → admin status change →
   order tracking — can be exercised locally before a Supabase project is
   wired up.

   ⚠️ Data lives in the Node process only (and is reset on restart). It is a
   developer convenience, never a production data source.
   ------------------------------------------------------------------ */

type LocalState = {
  products: StoreProduct[];
  orders: OrderRecord[];
  customers: CustomerRecord[];
};

const STATE_KEY = "__luxeLocalStore__";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getState(): LocalState {
  const globalScope = globalThis as typeof globalThis & {
    [STATE_KEY]?: LocalState;
  };
  if (!globalScope[STATE_KEY]) {
    globalScope[STATE_KEY] = {
      products: clone(seedProducts),
      orders: [],
      customers: [],
    };
  }
  return globalScope[STATE_KEY];
}

export function isLocalStoreActive(): boolean {
  return true;
}

/** Wipes orders/products/customers — used by the dev smoke test script. */
export function resetLocalStore(): void {
  const state = getState();
  state.products = clone(seedProducts);
  state.orders = [];
  state.customers = [];
}

function matchesProductQuery(product: StoreProduct, query: ProductQuery): boolean {
  if (!query.includeInactive && product.status !== "active") return false;
  if (query.category && product.category !== query.category) return false;
  if (query.search) {
    const needle = query.search.toLowerCase();
    const haystack = `${product.name} ${product.description} ${product.sku ?? ""}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

function sortProducts(items: StoreProduct[], query: ProductQuery): StoreProduct[] {
  const sorted = [...items];
  switch (query.orderBy) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export function localListProducts(query: ProductQuery = {}): StoreProduct[] {
  const state = getState();
  const filtered = sortProducts(
    state.products.filter((product) => matchesProductQuery(product, query)),
    query,
  );
  const offset = query.offset ?? 0;
  const limit = query.limit ?? filtered.length;
  return clone(filtered.slice(offset, offset + limit));
}

export function localCountProducts(query: ProductQuery = {}): number {
  return getState().products.filter((product) => matchesProductQuery(product, query)).length;
}

export function localFindProduct(idOrSlug: string): StoreProduct | null {
  const needle = idOrSlug.trim().toLowerCase();
  const found = getState().products.find(
    (product) =>
      product.id.toLowerCase() === needle || product.slug.toLowerCase() === needle,
  );
  return found ? clone(found) : null;
}

export function localGetProductById(id: string): StoreProduct | null {
  const found = getState().products.find((product) => product.id === id);
  return found ? clone(found) : null;
}

export function localGetProductsByIds(ids: string[]): StoreProduct[] {
  const state = getState();
  return clone(state.products.filter((product) => ids.includes(product.id)));
}
/* ------------------------------------------------------------------
   Product mutations
   ------------------------------------------------------------------ */

function uniqueSlug(base: string, ignoreId?: string): string {
  const state = getState();
  let slug = base;
  let suffix = 2;
  while (
    state.products.some(
      (product) => product.slug === slug && product.id !== ignoreId,
    )
  ) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

export function localCreateProduct(input: ProductInput): StoreProduct {
  const state = getState();
  const product: StoreProduct = {
    id: `local-${crypto.randomUUID()}`,
    slug: uniqueSlug(input.slug || "product"),
    name: input.name,
    price: input.price,
    compareAtPrice: input.compareAtPrice ?? null,
    category: input.category,
    image: input.image,
    galleryImages: input.galleryImages ?? [],
    description: input.description,
    features: input.features ?? [],
    rating: 5,
    reviewCount: 0,
    options:
      input.options && input.options.length > 0
        ? input.options
        : [{ label: "Option", values: ["Standard"] }],
    stockQuantity: input.stockQuantity,
    sku: input.sku ?? null,
    status: input.status,
  };
  if (input.badge) product.badge = input.badge;
  state.products.unshift(product);
  return clone(product);
}

export function localUpdateProduct(
  id: string,
  input: Partial<ProductInput>,
): StoreProduct | null {
  const state = getState();
  const index = state.products.findIndex((product) => product.id === id);
  if (index === -1) return null;

  const current = state.products[index];
  const next: StoreProduct = {
    ...current,
    name: input.name ?? current.name,
    slug: input.slug ? uniqueSlug(input.slug, id) : current.slug,
    price: input.price ?? current.price,
    compareAtPrice:
      input.compareAtPrice === undefined
        ? current.compareAtPrice
        : input.compareAtPrice,
    category: input.category ?? current.category,
    image: input.image ?? current.image,
    galleryImages: input.galleryImages ?? current.galleryImages,
    description: input.description ?? current.description,
    features: input.features ?? current.features,
    options:
      input.options && input.options.length > 0 ? input.options : current.options,
    stockQuantity: input.stockQuantity ?? current.stockQuantity,
    sku: input.sku === undefined ? current.sku : input.sku,
    status: input.status ?? current.status,
  };

  if (input.badge === undefined) {
    if (current.badge) next.badge = current.badge;
  } else if (input.badge) {
    next.badge = input.badge;
  } else {
    delete next.badge;
  }

  state.products[index] = next;
  return clone(next);
}

export function localDeleteProduct(id: string): boolean {
  const state = getState();
  const before = state.products.length;
  state.products = state.products.filter((product) => product.id !== id);
  return state.products.length < before;
}

/** Compare-and-swap stock decrement; returns false when stock is insufficient. */
export function localDecrementStock(productId: string, quantity: number): boolean {
  const state = getState();
  const product = state.products.find((item) => item.id === productId);
  if (!product) return false;
  if (product.stockQuantity < quantity) return false;
  product.stockQuantity -= quantity;
  return true;
}

export function localRestoreStock(productId: string, quantity: number): void {
  const state = getState();
  const product = state.products.find((item) => item.id === productId);
  if (product) product.stockQuantity += quantity;
}

/* ------------------------------------------------------------------
   Orders
   ------------------------------------------------------------------ */

export function localNextOrderNumber(date = new Date()): string {
  const state = getState();
  const sequence =
    highestSequence(
      state.orders.map((order) => order.orderNumber),
      date,
    ) + 1;
  return formatOrderNumber(sequence, date);
}

export type LocalOrderDraft = {
  orderNumber: string;
  customerId: string;
  customer: NewOrderInput["customer"];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  paymentMethod: NewOrderInput["paymentMethod"];
  notes: string | null;
  items: Array<Omit<OrderItemRecord, "id" | "orderId" | "createdAt">>;
};

export function localInsertOrder(draft: LocalOrderDraft): OrderRecord {
  const state = getState();
  const now = new Date().toISOString();
  const orderId = `local-order-${crypto.randomUUID()}`;

  const order: OrderRecord = {
    id: orderId,
    orderNumber: draft.orderNumber,
    customerId: draft.customerId,
    customerName: draft.customer.fullName,
    customerEmail: draft.customer.email,
    customerPhone: draft.customer.phone,
    shippingAddress: draft.customer.address,
    shippingCity: draft.customer.city,
    shippingPostalCode: draft.customer.postalCode,
    subtotal: draft.subtotal,
    shippingCost: draft.shippingCost,
    totalAmount: draft.totalAmount,
    paymentMethod: draft.paymentMethod,
    paymentStatus: "unpaid",
    orderStatus: "pending",
    notes: draft.notes,
    createdAt: now,
    updatedAt: now,
    items: draft.items.map((item) => ({
      ...item,
      id: `local-item-${crypto.randomUUID()}`,
      orderId,
      createdAt: now,
    })),
  };

  state.orders.unshift(order);
  return clone(order);
}

export function localDeleteOrder(orderId: string): void {
  const state = getState();
  state.orders = state.orders.filter((order) => order.id !== orderId);
}

export function localFindOrderByNumber(orderNumber: string): OrderRecord | null {
  const needle = orderNumber.trim().toUpperCase();
  const found = getState().orders.find(
    (order) => order.orderNumber.toUpperCase() === needle,
  );
  return found ? clone(found) : null;
}

export function localGetOrderById(id: string): OrderRecord | null {
  const found = getState().orders.find((order) => order.id === id);
  return found ? clone(found) : null;
}

function matchesOrderQuery(order: OrderRecord, query: OrderQuery): boolean {
  if (query.status && order.orderStatus !== query.status) return false;
  if (query.paymentStatus && order.paymentStatus !== query.paymentStatus) return false;
  if (query.search) {
    const needle = query.search.toLowerCase();
    const haystack =
      `${order.orderNumber} ${order.customerName} ${order.customerPhone} ${order.customerEmail}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  if (query.from && order.createdAt.slice(0, 10) < query.from) return false;
  if (query.to && order.createdAt.slice(0, 10) > query.to) return false;
  return true;
}

export function localListOrders(query: OrderQuery = {}): OrderQueryResult {
  const state = getState();
  const filtered = state.orders.filter((order) => matchesOrderQuery(order, query));
  const sorted = [...filtered].sort((a, b) =>
    query.orderBy === "oldest"
      ? a.createdAt.localeCompare(b.createdAt)
      : b.createdAt.localeCompare(a.createdAt),
  );
  const offset = query.offset ?? 0;
  const limit = query.limit ?? sorted.length;
  return {
    orders: clone(sorted.slice(offset, offset + limit)),
    total: sorted.length,
  };
}

export function localUpdateOrderStatus(
  id: string,
  orderStatus: OrderStatus,
  paymentStatus?: PaymentStatus,
): OrderRecord | null {
  const state = getState();
  const order = state.orders.find((item) => item.id === id);
  if (!order) return null;

  order.orderStatus = orderStatus;
  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  } else if (orderStatus === "delivered" && order.paymentStatus === "unpaid") {
    order.paymentStatus = "paid";
  }
  order.updatedAt = new Date().toISOString();
  return clone(order);
}

/* ------------------------------------------------------------------
   Customers
   ------------------------------------------------------------------ */

type CustomerInput = NewOrderInput["customer"];

export function localUpsertCustomer(input: CustomerInput): CustomerRecord {
  const state = getState();
  const now = new Date().toISOString();
  const existing = state.customers.find(
    (customer) =>
      customer.phone.replace(/\s+/g, "") === input.phone.replace(/\s+/g, ""),
  );

  if (existing) {
    existing.name = input.fullName;
    existing.email = input.email;
    existing.address = input.address;
    existing.city = input.city;
    existing.postalCode = input.postalCode;
    existing.updatedAt = now;
    return clone(existing);
  }

  const customer: CustomerRecord = {
    id: `local-customer-${crypto.randomUUID()}`,
    name: input.fullName,
    email: input.email,
    phone: input.phone,
    address: input.address,
    city: input.city,
    postalCode: input.postalCode,
    createdAt: now,
    updatedAt: now,
    totalOrders: 0,
    totalSpent: 0,
    lastOrderAt: null,
  };
  state.customers.push(customer);
  return clone(customer);
}

/** Folds order history into the customer aggregates shown in the admin panel. */
function withStats(customer: CustomerRecord, orders: OrderRecord[]): CustomerRecord {
  const relevant = orders.filter(
    (order) =>
      order.customerId === customer.id &&
      order.orderStatus !== "cancelled" &&
      order.orderStatus !== "returned",
  );

  return {
    ...customer,
    totalOrders: relevant.length,
    totalSpent: relevant.reduce((sum, order) => sum + order.totalAmount, 0),
    lastOrderAt: relevant.length
      ? relevant
          .map((order) => order.createdAt)
          .sort((a, b) => b.localeCompare(a))[0]
      : null,
  };
}

export function localListCustomers(search?: string): CustomerRecord[] {
  const state = getState();
  const needle = search?.trim().toLowerCase();
  return state.customers
    .filter((customer) =>
      needle
        ? `${customer.name} ${customer.email} ${customer.phone}`
            .toLowerCase()
            .includes(needle)
        : true,
    )
    .map((customer) => withStats(customer, state.orders))
    .sort((a, b) => (b.lastOrderAt ?? "").localeCompare(a.lastOrderAt ?? ""));
}

export function localGetCustomerById(
  id: string,
): { customer: CustomerRecord; orders: OrderRecord[] } | null {
  const state = getState();
  const customer = state.customers.find((item) => item.id === id);
  if (!customer) return null;

  return {
    customer: withStats(customer, state.orders),
    orders: clone(
      state.orders
        .filter((order) => order.customerId === id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    ),
  };
}

