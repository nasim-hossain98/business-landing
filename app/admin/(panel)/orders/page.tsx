import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import OrdersTable from "@/components/admin/OrdersTable";
import { listOrders, ADMIN_ORDERS_PAGE_SIZE } from "@/lib/orders/listOrders";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/db/types";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

type Search = {
  q?: string;
  status?: string;
  payment?: string;
  from?: string;
  to?: string;
  page?: string;
};

/** Query string for a page number, keeping every active filter. */
function pageHref(search: Search, page: number): string {
  const params = new URLSearchParams();
  for (const key of ["q", "status", "payment", "from", "to"] as const) {
    if (search[key]) params.set(key, search[key] as string);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

const fieldClass =
  "w-full rounded-xl border border-stone-700 bg-stone-800 px-3.5 py-2.5 text-sm text-white placeholder-stone-500 outline-none transition-colors focus:border-amber-500";
const labelClass = "mb-1.5 block text-[11px] uppercase tracking-wider text-stone-500";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const search = await searchParams;

  const status = ORDER_STATUSES.includes(search.status as OrderStatus)
    ? (search.status as OrderStatus)
    : undefined;
  const payment = PAYMENT_STATUSES.includes(search.payment as PaymentStatus)
    ? (search.payment as PaymentStatus)
    : undefined;
  const page = Math.max(1, Number(search.page) || 1);

  const { orders, total } = await listOrders({
    search: search.q || undefined,
    status,
    paymentStatus: payment,
    from: search.from || undefined,
    to: search.to || undefined,
    limit: ADMIN_ORDERS_PAGE_SIZE,
    offset: (page - 1) * ADMIN_ORDERS_PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_ORDERS_PAGE_SIZE));
  const hasFilters = Boolean(
    search.q || status || payment || search.from || search.to,
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-amber-500">
          Fulfilment
        </p>
        <h1 className="mt-2 font-heading text-4xl font-bold text-white">
          Orders
        </h1>
        <p className="mt-1.5 text-sm text-stone-500">
          {total} order{total === 1 ? "" : "s"} in this view
        </p>
      </div>

      {/* Filters — native GET form: works without JavaScript */}
      <form
        method="get"
        action="/admin/orders"
        className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className={labelClass}>Search</label>
            <input
              type="search"
              name="q"
              defaultValue={search.q ?? ""}
              placeholder="Order number, name, phone or email"
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select name="status" defaultValue={search.status ?? ""} className={fieldClass}>
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((value) => (
                <option key={value} value={value} className="capitalize">
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Payment</label>
            <select
              name="payment"
              defaultValue={search.payment ?? ""}
              className={fieldClass}
            >
              <option value="">All payments</option>
              {PAYMENT_STATUSES.map((value) => (
                <option key={value} value={value} className="capitalize">
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>From</label>
              <input
                type="date"
                name="from"
                defaultValue={search.from ?? ""}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>To</label>
              <input
                type="date"
                name="to"
                defaultValue={search.to ?? ""}
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-950 transition-all hover:shadow-lg hover:shadow-amber-500/20"
          >
            Apply filters
          </button>
          {hasFilters && (
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 px-4 py-2.5 text-xs font-medium text-stone-300 transition-colors hover:border-stone-500"
            >
              <X size={13} />
              Clear
            </Link>
          )}
        </div>
      </form>

      <OrdersTable orders={orders} />

      {totalPages > 1 && (
        <nav className="flex items-center justify-between gap-4 text-sm">
          {page > 1 ? (
            <Link
              href={pageHref(search, page - 1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 px-4 py-2.5 text-stone-300 transition-colors hover:border-amber-500/60 hover:text-amber-300"
            >
              <ChevronLeft size={15} />
              Previous
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-stone-800 px-4 py-2.5 text-stone-600">
              <ChevronLeft size={15} />
              Previous
            </span>
          )}

          <span className="text-xs uppercase tracking-wider text-stone-500">
            Page {page} of {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={pageHref(search, page + 1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 px-4 py-2.5 text-stone-300 transition-colors hover:border-amber-500/60 hover:text-amber-300"
            >
              Next
              <ChevronRight size={15} />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-stone-800 px-4 py-2.5 text-stone-600">
              Next
              <ChevronRight size={15} />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
