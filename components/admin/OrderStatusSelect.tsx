"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/db/statuses";

/**
 * Order lifecycle control.
 *
 * Sends `PATCH /api/admin/orders/[id]`, which re-checks the admin session on
 * the server. On success the router refreshes so the server-rendered detail
 * view (and the customer's tracking view via `revalidateOrderViews`) update.
 */
export default function OrderStatusSelect({
  orderId,
  orderStatus,
  paymentStatus,
}: {
  orderId: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(orderStatus);
  const [payment, setPayment] = useState<PaymentStatus>(paymentStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = status !== orderStatus || payment !== paymentStatus;

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: status, paymentStatus: payment }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not update the order.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        Update status
      </h3>

      <label className="mb-1.5 block text-[11px] text-stone-500">Order status</label>
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value as OrderStatus)}
        className="mb-4 w-full rounded-xl border border-stone-700 bg-stone-800 px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-amber-500"
      >
        {ORDER_STATUSES.map((value) => (
          <option key={value} value={value} className="capitalize">
            {value}
          </option>
        ))}
      </select>

      <label className="mb-1.5 block text-[11px] text-stone-500">Payment status</label>
      <select
        value={payment}
        onChange={(event) => setPayment(event.target.value as PaymentStatus)}
        className="mb-5 w-full rounded-xl border border-stone-700 bg-stone-800 px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-amber-500"
      >
        {PAYMENT_STATUSES.map((value) => (
          <option key={value} value={value} className="capitalize">
            {value}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={save}
        disabled={saving || !dirty}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-xs font-bold uppercase tracking-widest text-stone-950 transition-all hover:from-amber-400 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? (
          <Loader2 size={14} className="animate-spin" />
        ) : saved ? (
          <Check size={14} />
        ) : null}
        {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
      </button>

      {error && (
        <p className="mt-3 text-xs text-red-400">{error}</p>
      )}
      {!dirty && !error && (
        <p className="mt-3 text-center text-[11px] text-stone-600">
          No changes yet
        </p>
      )}
    </div>
  );
}
