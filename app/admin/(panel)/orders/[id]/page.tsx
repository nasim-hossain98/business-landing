import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Truck,
  StickyNote,
  CreditCard,
} from "lucide-react";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import OrderTimeline from "@/components/order/OrderTimeline";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/order/OrderStatusBadge";
import { getOrderById } from "@/lib/orders/getOrder";
import { PAYMENT_METHOD_LABELS } from "@/lib/pricing";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Order details" };
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            aria-label="Back to orders"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-700 text-stone-400 transition-colors hover:border-amber-500/60 hover:text-amber-300"
          >
            <ChevronLeft size={16} />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-amber-500">
              Order
            </p>
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              {order.orderNumber}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
          <span className="text-xs text-stone-500">
            {formatDateTime(order.createdAt)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items + totals */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Items
            </h2>
            <ul className="divide-y divide-stone-800">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-200">
                      {item.productName}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {item.selectedOption ? `${item.selectedOption} · ` : ""}
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-white tabular-nums">
                    {formatCurrency(item.subtotal)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 border-t border-stone-800 pt-4 text-sm">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span className="tabular-nums">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Shipping</span>
                <span className="tabular-nums">
                  {order.shippingCost === 0
                    ? "Free"
                    : formatCurrency(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold text-white">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer + shipping */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Customer
              </h2>
              <p className="text-sm font-semibold text-white">
                {order.customerName}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-stone-400">
                <li className="flex items-center gap-2">
                  <Phone size={14} className="text-amber-500/80" />
                  <span className="tabular-nums">{order.customerPhone}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={14} className="text-amber-500/80" />
                  <span className="truncate">{order.customerEmail || "—"}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Shipping
              </h2>
              <ul className="space-y-2 text-sm text-stone-400">
                <li className="flex items-start gap-2">
                  <MapPin
                    size={14}
                    className="mt-0.5 flex-shrink-0 text-amber-500/80"
                  />
                  <span>{order.shippingAddress}</span>
                </li>
                <li className="flex items-center gap-2 pl-[22px]">
                  <span>
                    {order.shippingCity}
                    {order.shippingPostalCode
                      ? ` · ${order.shippingPostalCode}`
                      : ""}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard size={14} className="text-amber-500/80" />
                  <span className="capitalize">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                      order.paymentMethod}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                <StickyNote size={13} />
                Customer notes
              </h2>
              <p className="text-sm text-stone-300">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <OrderStatusSelect
            orderId={order.id}
            orderStatus={order.orderStatus}
            paymentStatus={order.paymentStatus}
          />

          <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
            <h2 className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              <Truck size={13} />
              Status timeline
            </h2>
            <OrderTimeline status={order.orderStatus} />
            <p className="mt-5 text-[11px] text-stone-600">
              Updated {formatDateTime(order.updatedAt)} — the customer sees this
              on{" "}
              <Link
                href="/track-order"
                className="text-amber-500/80 hover:text-amber-400"
              >
                /track-order
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
