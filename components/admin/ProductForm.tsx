"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Save, X } from "lucide-react";
import type { ProductInput, StoreProduct } from "@/lib/products/types";
import { PRODUCT_CATEGORIES, slugify } from "@/lib/products/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/format";

const field =
  "w-full rounded-xl border border-stone-700 bg-stone-800 px-3.5 py-2.5 text-sm text-white placeholder-stone-500 outline-none transition-colors focus:border-amber-500";
const label =
  "mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-stone-500";

/**
 * Create / edit product form.
 *
 * Submits to the admin API which validates on the server; prices and stock are
 * only ever written here, then read back by the storefront through the data
 * layer. Optional Supabase Storage upload happens directly from the browser
 * with the admin's own session (Storage RLS).
 */
export default function ProductForm({
  product,
}: {
  /** Present ⇒ edit mode. */
  product?: StoreProduct;
}) {
  const router = useRouter();
  const editing = Boolean(product);

  const [form, setForm] = useState<ProductInput>(() => ({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    compareAtPrice: product?.compareAtPrice ?? null,
    category: product?.category ?? "others",
    image: product?.image ?? "",
    galleryImages: product?.galleryImages ?? [],
    badge: product?.badge ?? null,
    features: product?.features ?? [],
    options: product?.options ?? [],
    stockQuantity: product?.stockQuantity ?? 0,
    sku: product?.sku ?? null,
    status: product?.status ?? "active",
  }));

  const [featuresText, setFeaturesText] = useState(
    (product?.features ?? []).join("\n"),
  );
  const [optionLabel, setOptionLabel] = useState(product?.options[0]?.label ?? "");
  const [optionValues, setOptionValues] = useState(
    (product?.options[0]?.values ?? []).join(", "),
  );

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function update<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setError(null);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Image upload needs Supabase — paste an image URL instead.");
      return;
    }

    setUploading(true);
    try {
      const path = `${Date.now()}-${slugify(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "31536000", upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      update("image", data.publicUrl);
    } catch (uploadFailure) {
      setError(
        `Upload failed: ${uploadFailure instanceof Error ? uploadFailure.message : "unknown error"}. You can paste an image URL instead.`,
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const options = optionLabel.trim()
      ? [
          {
            label: optionLabel.trim(),
            values: optionValues
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean),
          },
        ].filter((option) => option.values.length > 0)
      : [];

    const payload: ProductInput = {
      ...form,
      slug: form.slug ? slugify(form.slug) : slugify(form.name),
      features: featuresText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
      options,
      compareAtPrice: form.compareAtPrice || null,
      badge: form.badge || null,
      sku: form.sku || null,
    };

    setSaving(true);
    try {
      const response = await fetch(
        editing ? `/api/admin/products/${product!.id}` : "/api/admin/products",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not save the product.");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Basics */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Basics
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label}>Name *</label>
              <input
                required
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Classic Navy Blazer"
                className={field}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={label}>Slug (URL)</label>
              <input
                value={form.slug}
                onChange={(event) => update("slug", event.target.value)}
                placeholder={slugify(form.name) || "product-url"}
                className={field}
              />
            </div>

            <div>
              <label className={label}>Category *</label>
              <select
                value={form.category}
                onChange={(event) =>
                  update(
                    "category",
                    event.target.value as ProductInput["category"],
                  )
                }
                className={field}
              >
                {PRODUCT_CATEGORIES.map((value) => (
                  <option key={value} value={value} className="capitalize">
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={label}>Status</label>
              <select
                value={form.status}
                onChange={(event) =>
                  update(
                    "status",
                    event.target.value as ProductInput["status"],
                  )
                }
                className={field}
              >
                <option value="active">active — visible in the shop</option>
                <option value="draft">draft — hidden</option>
                <option value="archived">archived — hidden</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={label}>Description *</label>
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Describe the material, fit and why it is special…"
                className={`${field} resize-y`}
              />
            </div>
          </div>
        </div>

        {/* Pricing + inventory */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Pricing &amp; inventory
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={label}>Price (৳) *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={form.price || ""}
                onChange={(event) => update("price", Number(event.target.value))}
                className={field}
              />
            </div>
            <div>
              <label className={label}>Compare-at (৳)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.compareAtPrice ?? ""}
                onChange={(event) =>
                  update(
                    "compareAtPrice",
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
                className={field}
              />
            </div>
            <div>
              <label className={label}>Stock *</label>
              <input
                required
                type="number"
                min="0"
                value={form.stockQuantity}
                onChange={(event) =>
                  update("stockQuantity", Number(event.target.value))
                }
                className={field}
              />
            </div>
            <div>
              <label className={label}>SKU</label>
              <input
                value={form.sku ?? ""}
                onChange={(event) => update("sku", event.target.value)}
                placeholder="LUXE-BLZ-001"
                className={field}
              />
            </div>
            <div>
              <label className={label}>Badge</label>
              <input
                value={form.badge ?? ""}
                onChange={(event) => update("badge", event.target.value)}
                placeholder="New / Best Seller"
                className={field}
              />
            </div>
            <div>
              <label className={label}>Preview</label>
              <p className="rounded-xl border border-stone-800 bg-stone-950/60 px-3.5 py-2.5 text-sm text-amber-400 tabular-nums">
                {formatCurrency(form.price || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Media + details */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Media &amp; details
          </h2>

          <div className="space-y-4">
            <div>
              <label className={label}>Image URL *</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  required
                  value={form.image}
                  onChange={(event) => update("image", event.target.value)}
                  placeholder="/images/product-1.jpg or https://…"
                  className={field}
                />
                <label className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-stone-600 px-4 py-2.5 text-xs font-medium text-stone-300 transition-colors hover:border-amber-500/60 hover:text-amber-300">
                  {uploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ImagePlus size={14} />
                  )}
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleUpload(event.target.files?.[0])}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Features (one per line)</label>
                <textarea
                  rows={4}
                  value={featuresText}
                  onChange={(event) => setFeaturesText(event.target.value)}
                  placeholder={"100% premium wool\nModern slim fit"}
                  className={`${field} resize-y`}
                />
              </div>
              <div className="space-y-3">
                <div>
                  <label className={label}>Option label</label>
                  <input
                    value={optionLabel}
                    onChange={(event) => setOptionLabel(event.target.value)}
                    placeholder="Size / Color"
                    className={field}
                  />
                </div>
                <div>
                  <label className={label}>Values (comma separated)</label>
                  <input
                    value={optionValues}
                    onChange={(event) => setOptionValues(event.target.value)}
                    placeholder="S, M, L, XL"
                    className={field}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Publish
          </h2>

          {error && (
            <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
              {error}
            </p>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-xs font-bold uppercase tracking-widest text-stone-950 transition-all hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {saving ? "Saving…" : editing ? "Save changes" : "Create product"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700 px-5 py-3 text-xs font-medium text-stone-300 transition-colors hover:border-stone-500"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 text-xs leading-relaxed text-stone-500">
          <p className="mb-2 font-semibold uppercase tracking-wider text-stone-400">
            Good to know
          </p>
          <ul className="list-disc space-y-1.5 pl-4">
            <li>Price and stock are re-checked on the server at checkout.</li>
            <li>Publishing immediately updates /shop, /product and the home page.</li>
            <li>Archiving hides a product without deleting its history.</li>
          </ul>
        </div>
      </div>
    </form>
  );
}

