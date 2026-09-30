"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, AlertTriangle } from "lucide-react";
import type { PublicOrder } from "@/lib/db/client-types";
import { formatCurrency, formatDateTime } from "@/lib/format";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/order/OrderStatusBadge";
import OrderTimeline from "@/components/order/OrderTimeline";

/**
 * /track-order
 *
 * Requires the order number **and** the phone number used at checkout. The
 * request goes to `GET /api/orders/[orderNumber]?phone=…`, which answers with a
 * whitelisted projection (`toPublicOrder`) — no email, phone or address.
 */
export default function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(orderNumber.trim())}?phone=${encodeURIComponent(phone.trim())}`,
        { headers: { Accept: "application/json" } },
      );
      const data = (await response.json()) as {
        order?: PublicOrder;
        error?: string;
      };

      if (!response.ok || !data.order) {
        setError(data.error ?? "We could not find that order.");
        return;
      }
      setOrder(data.order);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-stone-200 bg-stone-50 p-7 dark:border-stone-800 dark:bg-stone-900"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Order Number
            </label>
            <input
              required
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
              placeholder="LUXE-20260930-0001"
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Phone Number
            </label>
            <input
              required
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+880 1XXXXXXXXX"
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full btn-slide px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-amber-500/25 transition-all duration-500 hover:scale-[1.01] disabled:opacity-60 sm:w-auto"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
          {loading ? "Looking up…" : "Track Order"}
        </button>

        <p className="mt-4 text-xs text-stone-500 dark:text-stone-400">
          For your privacy we ask for the phone number you used at checkout as
          well as the order number.
        </p>
      </form>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm dark:border-red-500/30 dark:bg-red-500/10">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-red-500" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {order && <TrackedOrder order={order} />}
    </div>
  );
}

/** Result panel — the only view that renders tracked order data. */
function TrackedOrder({ order }: { order: PublicOrder }) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-3xl border border-stone-200 bg-white p-7 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
                Order
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-stone-900 dark:text-white">
                {order.orderNumber}
              </p>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Placed {formatDateTime(order.createdAt)}
                {order.city ? ` · ${order.city}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <OrderStatusBadge status={order.orderStatus} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>

          <ul className="mt-7 divide-y divide-stone-100 dark:divide-stone-800">
            {order.items.map((item, index) => (
              <li
                key={`${item.name}-${index}`}
                className="flex items-center gap-4 py-4"
              >
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {item.slug ? (
                    <Link
                      href={`/product/${item.slug}`}
                      className="block truncate text-sm font-semibold text-stone-900 hover:text-amber-600 dark:text-white"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="truncate text-sm font-semibold text-stone-900 dark:text-white">
                      {item.name}
                    </p>
                  )}
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                    {item.option ? ` · ${item.option}` : ""}
                  </p>
                </div>
                <span className="text-sm font-semibold text-stone-900 dark:text-white tabular-nums">
                  {formatCurrency(item.subtotal)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border-t border-stone-100 pt-4 text-sm dark:border-stone-800">
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Shipping</span>
              <span className="tabular-nums">
                {order.shippingCost === 0
                  ? "Free"
                  : formatCurrency(order.shippingCost)}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-stone-900 dark:text-white">
              <span>Total</span>
              <span className="tabular-nums">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-7 dark:border-stone-800 dark:bg-stone-900">
        <h2 className="mb-6 font-heading text-xl font-semibold text-stone-900 dark:text-white">
          Delivery Status
        </h2>
        <OrderTimeline status={order.orderStatus} />
        <p className="mt-6 text-xs text-stone-500 dark:text-stone-400">
          Last updated {formatDateTime(order.updatedAt)}
        </p>
      </div>
    </div>
  );
}
