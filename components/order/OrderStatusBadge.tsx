import type { OrderStatus, PaymentStatus } from "@/lib/db/statuses";

const ORDER_STYLES: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
  },
  confirmed: {
    label: "Confirmed",
    className:
      "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30",
  },
  processing: {
    label: "Processing",
    className:
      "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30",
  },
  shipped: {
    label: "Shipped",
    className:
      "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30",
  },
  delivered: {
    label: "Delivered",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30",
  },
  returned: {
    label: "Returned",
    className:
      "bg-stone-100 text-stone-600 ring-stone-200 dark:bg-stone-700/40 dark:text-stone-300 dark:ring-stone-600/40",
  },
};

const PAYMENT_STYLES: Record<PaymentStatus, { label: string; className: string }> = {
  unpaid: {
    label: "Unpaid",
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
  },
  paid: {
    label: "Paid",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
  },
  refunded: {
    label: "Refunded",
    className:
      "bg-stone-100 text-stone-600 ring-stone-200 dark:bg-stone-700/40 dark:text-stone-300 dark:ring-stone-600/40",
  },
  failed: {
    label: "Failed",
    className:
      "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30",
  },
};

const base =
  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ring-1 whitespace-nowrap";

export function OrderStatusBadge({
  status,
  className = "",
}: {
  status: OrderStatus;
  className?: string;
}) {
  const style = ORDER_STYLES[status] ?? ORDER_STYLES.pending;
  return <span className={`${base} ${style.className} ${className}`}>{style.label}</span>;
}

export function PaymentStatusBadge({
  status,
  className = "",
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const style = PAYMENT_STYLES[status] ?? PAYMENT_STYLES.unpaid;
  return <span className={`${base} ${style.className} ${className}`}>{style.label}</span>;
}

export { ORDER_STYLES, PAYMENT_STYLES };
