/**
 * Canonical catalogue types for the LUXE storefront.
 *
 * These types are shared by:
 *  - the static seed catalogue (`data/products.ts`)
 *  - the Supabase products table (`supabase/migrations/001_products.sql`)
 *  - the local development fallback store (`lib/db/memory.ts`)
 *
 * Keeping a single shape means the landing page, /shop, /product/[id], the
 * cart and the admin panel can all reuse the same presentational components.
 */

export type ProductCategory = "clothes" | "wallets" | "bags" | "others";

/** Products are only visible on the storefront when `status === "active"`. */
export type ProductStatus = "active" | "draft" | "archived";

export type ProductOption = {
  label: string;
  values: string[];
};

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  category: ProductCategory;
  image: string;
  galleryImages: string[];
  badge?: string;
  description: string;
  features: string[];
  rating: number;
  reviewCount: number;
  options: ProductOption[];
  stockQuantity: number;
  sku: string | null;
  status: ProductStatus;
};

/** Payload accepted when an admin creates or edits a product. */
export type ProductInput = {
  name: string;
  slug?: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  category: ProductCategory;
  image: string;
  galleryImages?: string[];
  badge?: string | null;
  features?: string[];
  options?: ProductOption[];
  stockQuantity: number;
  sku?: string | null;
  status: ProductStatus;
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "clothes",
  "wallets",
  "bags",
  "others",
];

export const PRODUCT_STATUSES: ProductStatus[] = ["active", "draft", "archived"];

export const DEFAULT_PRODUCT_OPTIONS: ProductOption[] = [
  { label: "Size", values: ["S", "M", "L", "XL"] },
];

/** URL-safe slug used for `/product/[slug]` links. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
