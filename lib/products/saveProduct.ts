import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rowToStoreProduct, type ProductRow } from "@/lib/db/mappers";
import { localCreateProduct, localUpdateProduct } from "@/lib/db/local-store";
import { PRODUCT_COLUMNS } from "@/lib/products/getProducts";
import { slugify, type ProductInput, type StoreProduct } from "@/lib/products/types";

/** Columns written to the `products` table. */
function toRow(input: ProductInput) {
  return {
    name: input.name,
    slug: input.slug ? slugify(input.slug) : slugify(input.name),
    description: input.description,
    price: input.price,
    compare_at_price: input.compareAtPrice ?? null,
    category: input.category,
    image_url: input.image,
    gallery_images: input.galleryImages ?? [],
    stock_quantity: input.stockQuantity,
    sku: input.sku ?? null,
    status: input.status,
    badge: input.badge ?? null,
    features: input.features ?? [],
    options: input.options && input.options.length > 0 ? input.options : [],
  };
}

export class ProductWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductWriteError";
  }
}

export async function createProduct(input: ProductInput): Promise<StoreProduct> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return localCreateProduct(input);

  const { data, error } = await supabase
    .from("products")
    .insert(toRow(input))
    .select(PRODUCT_COLUMNS)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ProductWriteError("A product with this slug already exists.");
    }
    throw new ProductWriteError(error.message);
  }
  return rowToStoreProduct(data as unknown as ProductRow);
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<StoreProduct> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    const updated = localUpdateProduct(id, input);
    if (!updated) throw new ProductWriteError("Product not found.");
    return updated;
  }

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.slug !== undefined) patch.slug = slugify(input.slug);
  if (input.description !== undefined) patch.description = input.description;
  if (input.price !== undefined) patch.price = input.price;
  if (input.compareAtPrice !== undefined) {
    patch.compare_at_price = input.compareAtPrice;
  }
  if (input.category !== undefined) patch.category = input.category;
  if (input.image !== undefined) patch.image_url = input.image;
  if (input.galleryImages !== undefined) patch.gallery_images = input.galleryImages;
  if (input.stockQuantity !== undefined) patch.stock_quantity = input.stockQuantity;
  if (input.sku !== undefined) patch.sku = input.sku;
  if (input.status !== undefined) patch.status = input.status;
  if (input.badge !== undefined) patch.badge = input.badge;
  if (input.features !== undefined) patch.features = input.features;
  if (input.options !== undefined) patch.options = input.options;

  if (Object.keys(patch).length === 0) {
    throw new ProductWriteError("Nothing to update.");
  }

  const { data, error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", id)
    .select(PRODUCT_COLUMNS)
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw new ProductWriteError("A product with this slug already exists.");
    }
    throw new ProductWriteError(error.message);
  }
  if (!data) throw new ProductWriteError("Product not found.");

  return rowToStoreProduct(data as unknown as ProductRow);
}
