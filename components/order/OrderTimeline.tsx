import { Check, Clock, XCircle, Undo2 } from "lucide-react";
import {
  TIMELINE_STATUSES,
  type OrderStatus,
  type TimelineStatus,
} from "@/lib/db/statuses";

const LABELS: Record<TimelineStatus, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

const HINTS: Record<TimelineStatus, string> = {
  pending: "We received your order and are reviewing it.",
  confirmed: "Your order has been confirmed and is being prepared.",
  processing: "Your items are being packed.",
  shipped: "Your parcel is on the way.",
  delivered: "Delivered — enjoy!",
};

/**
 * Customer-facing status ladder: Order Placed → Confirmed → Processing →
 * Shipped → Delivered. Cancelled / returned orders get a terminal notice
 * instead of a progress bar. Shared with the admin order details view.
 */
export default function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled" || status === "returned") {
    const cancelled = status === "cancelled";
    return (
      <div
        className={`flex items-start gap-3 rounded-2xl border p-5 ${
          cancelled
            ? "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10"
            : "border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/50"
        }`}
      >
        {cancelled ? (
          <XCircle size={20} className="mt-0.5 flex-shrink-0 text-red-500" />
        ) : (
          <Undo2 size={20} className="mt-0.5 flex-shrink-0 text-stone-500" />
        )}
        <div>
          <p className="text-sm font-semibold text-stone-900 dark:text-white">
            {cancelled ? "Order cancelled" : "Order returned"}
          </p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            {cancelled
              ? "This order was cancelled. If you have questions, please contact us."
              : "This order was returned and closed."}
          </p>
        </div>
      </div>
    );
  }

  const activeIndex = Math.max(
    0,
    (TIMELINE_STATUSES as readonly string[]).indexOf(status),
  );

  return (
    <ol className="relative space-y-6">
      {TIMELINE_STATUSES.map((step, index) => {
        const done = index < activeIndex;
        const current = index === activeIndex;
        const reached = index <= activeIndex;

        return (
          <li key={step} className="relative flex gap-4">
            {index < TIMELINE_STATUSES.length - 1 && (
              <span
                aria-hidden
                className={`absolute left-[15px] top-8 h-[calc(100%+0.5rem)] w-px ${
                  index < activeIndex
                    ? "bg-amber-400"
                    : "bg-stone-200 dark:bg-stone-700"
                }`}
              />
            )}

            <span
              className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-1 ${
                reached
                  ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white ring-amber-300"
                  : "bg-white text-stone-400 ring-stone-200 dark:bg-stone-900 dark:ring-stone-700"
              }`}
            >
              {done ? <Check size={15} strokeWidth={3} /> : <Clock size={14} />}
            </span>

            <div className="pt-0.5">
              <p
                className={`text-sm font-semibold ${
                  reached
                    ? "text-stone-900 dark:text-white"
                    : "text-stone-400 dark:text-stone-500"
                }`}
              >
                {LABELS[step]}
                {current && (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                    Current
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {HINTS[step]}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
