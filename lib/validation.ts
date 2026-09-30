import "server-only";

import { isPaymentMethod, type PaymentMethod } from "@/lib/pricing";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  slugify,
  type ProductCategory,
  type ProductInput,
  type ProductOption,
  type ProductStatus,
} from "@/lib/products/types";
import type { NewOrderInput, OrderStatus, PaymentStatus } from "@/lib/db/types";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/db/types";

/* ------------------------------------------------------------------
   Minimal, dependency-free validation used by every write endpoint.
   Input is always treated as untrusted.
   ------------------------------------------------------------------ */

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const MAX_TEXT = 4000;

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function asInt(value: unknown): number | null {
  const parsed = asNumber(value);
  return parsed === null ? null : Math.trunc(parsed);
}

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => asString(entry))
      .filter((entry) => entry.length > 0)
      .slice(0, 40);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 40);
  }
  return [];
}

export function asOptions(value: unknown): ProductOption[] {
  let entries: unknown = value;
  if (typeof value === "string" && value.trim()) {
    try {
      entries = JSON.parse(value);
    } catch {
      entries = value.split("\n").map((line) => {
        const [label, values = ""] = line.split(":");
        return { label, values: values.split(",").map((v) => v.trim()) };
      });
    }
  }
  if (!Array.isArray(entries)) return [];

  const options: ProductOption[] = [];
  for (const entry of entries) {
    const record = asRecord(entry);
    const label = asString(record.label);
    const values = asStringArray(record.values);
    if (label && values.length > 0) options.push({ label, values });
  }
  return options.slice(0, 4);
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/** Accepts +8801XXXXXXXXX / 01XXXXXXXXX / 0155-123456 style numbers. */
export function isPhone(value: string): boolean {
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 7 && digits.length <= 20;
}

export function truncate(value: string, max = MAX_TEXT): string {
  return value.length > max ? value.slice(0, max) : value;
}

/** Digits only so `+880 1712-345678` can be matched against `01812345678`. */
export function phoneKey(value: string): string {
  return value.replace(/\D/g, "").replace(/^880/, "0");
}

/* ------------------------------------------------------------------
   Product payload → ProductInput
   ------------------------------------------------------------------ */

export function parseProductPayload(raw: unknown): Result<ProductInput> {
  const record = asRecord(raw);

  const name = truncate(asString(record.name), 160);
  if (name.length < 2) return { ok: false, error: "Product name is required." };

  const description = truncate(asString(record.description));
  if (description.length < 10) {
    return { ok: false, error: "Description must be at least 10 characters." };
  }

  const price = asNumber(record.price);
  if (price === null || price <= 0) {
    return { ok: false, error: "Price must be greater than zero." };
  }

  const compareAtRaw = record.compareAtPrice ?? record.compare_at_price;
  let compareAtPrice: number | null = null;
  if (compareAtRaw !== undefined && compareAtRaw !== null && compareAtRaw !== "") {
    const parsed = asNumber(compareAtRaw);
    if (parsed === null || parsed < 0) {
      return { ok: false, error: "Compare-at price must be a positive number." };
    }
    compareAtPrice = parsed > 0 ? parsed : null;
  }

  const category = asString(record.category) as ProductCategory;
  if (!PRODUCT_CATEGORIES.includes(category)) {
    return { ok: false, error: "Choose a valid category." };
  }

  const image = asString(record.image) || asString(record.image_url);
  if (!image) return { ok: false, error: "A product image is required." };

  const stockQuantity = asInt(record.stockQuantity ?? record.stock_quantity ?? 0);
  if (stockQuantity === null || stockQuantity < 0) {
    return { ok: false, error: "Stock quantity cannot be negative." };
  }

  const statusRaw = asString(record.status) as ProductStatus;
  const status: ProductStatus = PRODUCT_STATUSES.includes(statusRaw)
    ? statusRaw
    : "active";

  return {
    ok: true,
    value: {
      name,
      slug: slugify(asString(record.slug) || name),
      description,
      price,
      compareAtPrice,
      category,
      image: truncate(image, 1000),
      galleryImages: asStringArray(
        record.galleryImages ?? record.gallery_images,
      ),
      badge: asString(record.badge) || null,
      features: asStringArray(record.features),
      options: asOptions(record.options),
      stockQuantity,
      sku: asString(record.sku) || null,
      status,
    },
  };
}

/* ------------------------------------------------------------------
   Order payload → NewOrderInput
   ------------------------------------------------------------------ */

export function parseOrderPayload(raw: unknown): Result<NewOrderInput> {
  const record = asRecord(raw);
  const customerNode = asRecord(record.customer);

  const fullName = truncate(asString(customerNode.fullName), 120);
  if (fullName.length < 2) return { ok: false, error: "Full name is required." };

  const phone = truncate(asString(customerNode.phone), 32);
  if (!isPhone(phone)) {
    return { ok: false, error: "A valid phone number is required." };
  }

  const email = truncate(asString(customerNode.email), 160);
  if (email && !isEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const address = truncate(asString(customerNode.address), 400);
  if (address.length < 5) {
    return { ok: false, error: "Delivery address is required." };
  }

  const city = truncate(asString(customerNode.city), 80);
  if (city.length < 2) return { ok: false, error: "City is required." };

  const postalCode = truncate(asString(customerNode.postalCode), 20);
  if (postalCode.length < 3) {
    return { ok: false, error: "Postal code is required." };
  }

  const itemsNode = Array.isArray(record.items) ? record.items : [];
  if (itemsNode.length === 0) return { ok: false, error: "Your cart is empty." };
  if (itemsNode.length > 50) {
    return { ok: false, error: "Too many distinct items in one order." };
  }

  const items: NewOrderInput["items"] = [];
  for (const entry of itemsNode) {
    const item = asRecord(entry);
    const productId = asString(item.productId ?? item.product_id);
    if (!productId) {
      return { ok: false, error: "A cart line is missing its product." };
    }

    const quantity = asInt(item.quantity);
    if (quantity === null || quantity < 1 || quantity > 50) {
      return { ok: false, error: "Quantities must be between 1 and 50." };
    }

    items.push({
      productId,
      quantity,
      selectedOption: asString(item.selectedOption ?? item.selected_option) || null,
    });
  }

  const paymentMethodRaw = asString(record.paymentMethod ?? record.payment_method);
  const paymentMethod: PaymentMethod = isPaymentMethod(paymentMethodRaw)
    ? paymentMethodRaw
    : "cod";

  return {
    ok: true,
    value: {
      items,
      customer: { fullName, email, phone, address, city, postalCode },
      paymentMethod,
      notes: truncate(asString(record.notes), 1000) || null,
    },
  };
}

export function parseOrderStatus(value: unknown): OrderStatus | null {
  const candidate = asString(value).toLowerCase();
  return ORDER_STATUSES.includes(candidate as OrderStatus)
    ? (candidate as OrderStatus)
    : null;
}

export function parsePaymentStatus(value: unknown): PaymentStatus | null {
  const candidate = asString(value).toLowerCase();
  return PAYMENT_STATUSES.includes(candidate as PaymentStatus)
    ? (candidate as PaymentStatus)
    : null;
}

