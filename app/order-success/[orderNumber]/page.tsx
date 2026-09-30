import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, PackageSearch, Truck, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import OrderTimeline from "@/components/order/OrderTimeline";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/order/OrderStatusBadge";
import { getOrderByNumber, toPublicOrder } from "@/lib/orders/getOrder";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order Confirmed — LUXE",
};

/**
 * /order-success/[orderNumber]
 *
 * Rendered right after checkout. Shows a **safe projection** of the order —
 * no phone number, no email, no full address — so an order number alone can
 * never leak a customer's personal data.
 *
 * Dynamic on purpose: the customer must see the live status, not a cached copy.
 */
export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const record = await getOrderByNumber(orderNumber);
  if (!record) notFound();

  const order = toPublicOrder(record);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-white dark:bg-stone-950">
        <div className="mx-auto max-w-5xl px-6">
          <AnimatedSection className="py-12 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={40} className="text-white" />
            </div>
            <h1 className="font-heading text-4xl font-bold text-stone-900 dark:text-white sm:text-5xl">
              Thank you — your order is in!
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-stone-500 dark:text-stone-400">
              We&apos;ll confirm it shortly
              {order.city ? ` and deliver to ${order.city}` : ""}. Keep this
              order number handy — you&apos;ll need it to track your delivery.
            </p>

            <div className="mt-8 inline-flex flex-col items-center rounded-3xl border border-stone-200 bg-stone-50 px-10 py-7 dark:border-stone-800 dark:bg-stone-900">
              <span className="text-xs uppercase tracking-[0.24em] text-stone-400">
                Order Number
              </span>
              <span className="mt-2 font-heading text-3xl font-bold tracking-wide text-stone-900 dark:text-white sm:text-4xl">
                {order.orderNumber}
              </span>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <OrderStatusBadge status={order.orderStatus} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/track-order"
                className="inline-flex items-center gap-2 rounded-full btn-slide px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-amber-500/25 transition-all duration-500 hover:scale-[1.03]"
              >
                <PackageSearch size={16} />
                Track this order
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-stone-700 transition-all duration-300 hover:border-amber-400 hover:text-amber-600 dark:border-stone-700 dark:text-stone-200"
              >
                Continue shopping
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-8 pb-8 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-3xl border border-stone-200 bg-white p-7 dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-semibold text-stone-900 dark:text-white">
                  Order Summary
                </h2>
                <span className="text-xs text-stone-400">
                  {formatDateTime(order.createdAt)}
                </span>
              </div>

              <ul className="mt-6 divide-y divide-stone-100 dark:divide-stone-800">
                {order.items.map((item, index) => (
                  <li
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between gap-4 py-4 text-sm"
                  >
                    <div>
                      <p className="font-medium text-stone-900 dark:text-white">
                        {item.name}
                        {item.option ? (
                          <span className="ml-2 text-xs text-stone-400">
                            {item.option}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-semibold text-stone-900 dark:text-white tabular-nums">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-2 border-t border-stone-100 pt-4 text-sm dark:border-stone-800">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Subtotal</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Shipping</span>
                  <span className="tabular-nums">
                    {order.shippingCost === 0
                      ? "Free"
                      : formatCurrency(order.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-stone-900 dark:text-white">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-7 dark:border-stone-800 dark:bg-stone-900">
              <h2 className="mb-6 font-heading text-xl font-semibold text-stone-900 dark:text-white">
                What happens next
              </h2>
              <OrderTimeline status={order.orderStatus} />
            </div>
          </div>

          <div className="mb-16 flex flex-wrap justify-center gap-6 text-xs text-stone-500 dark:text-stone-400">
            <span className="inline-flex items-center gap-2">
              <Truck size={14} className="text-amber-500" /> Free shipping over ৳50
            </span>
            <span className="inline-flex items-center gap-2">
              <Shield size={14} className="text-amber-500" /> Your details stay
              private
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
