import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { OrderRecord } from "@/lib/db/types";
import { formatCurrency, formatDateTime } from "@/lib/format";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/order/OrderStatusBadge";

/**
 * Admin order table (server component — no client JS unless a control is
 * embedded). Horizontal scroll keeps it usable from 375px up without dropping
 * any of the requested columns.
 */
export default function OrdersTable({
  orders,
  actionHref = (order: OrderRecord) => `/admin/orders/${order.id}`,
}: {
  orders: OrderRecord[];
  actionHref?: (order: OrderRecord) => string;
}) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-700 px-6 py-14 text-center">
        <p className="text-sm text-stone-400">No orders match this view.</p>
        <p className="mt-1 text-xs text-stone-600">
          Try clearing the filters, or place a test order from the storefront.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/60">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-800 text-[11px] uppercase tracking-[0.14em] text-stone-500">
              <th className="px-5 py-3.5 font-semibold">Order</th>
              <th className="px-5 py-3.5 font-semibold">Customer</th>
              <th className="px-5 py-3.5 font-semibold">Phone</th>
              <th className="px-5 py-3.5 font-semibold">Total</th>
              <th className="px-5 py-3.5 font-semibold">Payment</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Date</th>
              <th className="px-5 py-3.5 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/70">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="group transition-colors hover:bg-stone-800/40"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative hidden h-9 w-9 overflow-hidden rounded-lg bg-stone-800 sm:block">
                      {order.items[0]?.productImage && (
                        <Image
                          src={order.items[0].productImage}
                          alt=""
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="font-medium text-white">
                      {order.orderNumber}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-stone-200">
                    {order.customerName}
                  </p>
                  <p className="text-xs text-stone-500">
                    {order.customerEmail || "no email"}
                  </p>
                </td>
                <td className="px-5 py-4 text-stone-300 tabular-nums">
                  {order.customerPhone}
                </td>
                <td className="px-5 py-4 font-semibold text-white tabular-nums">
                  {formatCurrency(order.totalAmount)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs capitalize text-stone-400">
                      {order.paymentMethod}
                    </span>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <OrderStatusBadge status={order.orderStatus} />
                </td>
                <td className="px-5 py-4 text-xs text-stone-400">
                  {formatDateTime(order.createdAt)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={actionHref(order)}
                    aria-label={`Open order ${order.orderNumber}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-700 text-stone-400 transition-all hover:border-amber-500/60 hover:text-amber-400"
                  >
                    <ArrowUpRight size={15} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
