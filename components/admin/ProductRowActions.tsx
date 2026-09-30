"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import type { StoreProduct } from "@/lib/products/types";

/**
 * Row controls for the products table: edit, publish/unpublish and delete.
 * Every call hits an admin-authenticated API route; nothing here can change
 * data without the server re-checking the session.
 */
export default function ProductRowActions({ product }: { product: StoreProduct }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"status" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const published = product.status === "active";

  async function toggleStatus() {
    setBusy("status");
    setError(null);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: published ? "archived" : "active",
        }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Could not update status.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete "${product.name}"? Past orders keep their own snapshot of this item.`,
      )
    ) {
      return;
    }
    setBusy("delete");
    setError(null);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Could not delete.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/admin/products/${product.id}/edit`}
        aria-label={`Edit ${product.name}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-700 text-stone-400 transition-colors hover:border-amber-500/60 hover:text-amber-300"
      >
        <Pencil size={14} />
      </Link>

      <button
        type="button"
        onClick={toggleStatus}
        disabled={busy !== null}
        aria-label={published ? "Unpublish product" : "Publish product"}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50 ${
          published
            ? "border-stone-700 text-stone-400 hover:border-emerald-500/60 hover:text-emerald-300"
            : "border-emerald-500/40 text-emerald-400 hover:border-emerald-400"
        }`}
      >
        {busy === "status" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : published ? (
          <Eye size={14} />
        ) : (
          <EyeOff size={14} />
        )}
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={busy !== null}
        aria-label={`Delete ${product.name}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-700 text-stone-400 transition-colors hover:border-red-500/60 hover:text-red-400 disabled:opacity-50"
      >
        {busy === "delete" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Trash2 size={14} />
        )}
      </button>

      {error && (
        <span className="ml-1 text-[11px] text-red-400">{error}</span>
      )}
    </div>
  );
}
