import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, Package, Users, TrendingUp } from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import RevenueChart from "@/components/admin/RevenueChart";
import OrdersTable from "@/components/admin/OrdersTable";
import { getAnalytics } from "@/lib/analytics/getAnalytics";
import { PAYMENT_METHOD_LABELS } from "@/lib/pricing";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

/** /admin/analytics — business numbers, all derived from the orders table. */
export default async function AdminAnalyticsPage() {
  const data = await getAnalytics();
  const topStatus =
    data.statusDistribution.reduce(
      (top, entry) => (entry.count > top.count ? entry : top),
      { count: 0, revenue: 0 },
    ).count;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-amber-500">
          Business
        </p>
        <h1 className="mt-2 font-heading text-4xl font-bold text-white">
          Analytics
        </h1>
        <p className="mt-1.5 text-sm text-stone-500">
          Revenue, orders, customers and bestsellers — computed from real orders
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Revenue (all time)"
          value={data.totalRevenue}
          icon={Banknote}
          accent="amber"
          prefix="currency"
          hint={`${formatCurrency(data.revenue30d)} in the last 30 days`}
        />
        <StatsCard
          label="Total orders"
          value={data.totalOrders}
          icon={Package}
          accent="sky"
          hint={`${data.cancelledOrders} cancelled · ${data.returnedOrders} returned`}
        />
        <StatsCard
          label="Customers"
          value={data.totalCustomers}
          icon={Users}
          accent="emerald"
          hint="unique buyers"
        />
        <StatsCard
          label="Avg. order value"
          value={data.averageOrderValue}
          icon={TrendingUp}
          accent="violet"
          prefix="currency"
          hint="excludes cancelled"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart
            data={data.revenueByDay}
            title="Revenue — by day"
            height={260}
          />
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-stone-400">
            Status distribution
          </h3>

          <ul className="space-y-3">
            {data.statusDistribution.map((entry) => (
              <li key={entry.status}>
                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize text-stone-300">{entry.status}</span>
                  <span className="tabular-nums text-stone-500">
                    {entry.count} · {formatCurrency(entry.revenue)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                    style={{
                      width: `${topStatus > 0 ? Math.max(3, (entry.count / topStatus) * 100) : 0}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <h3 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-stone-400">
            Payment methods
          </h3>
          <ul className="space-y-3">
            {data.paymentSplit.map((entry) => (
              <li
                key={entry.method}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-stone-300">
                  {PAYMENT_METHOD_LABELS[entry.method] ?? entry.method}
                </span>
                <span className="tabular-nums text-stone-500">
                  {entry.count} orders · {formatCurrency(entry.revenue)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 xl:col-span-2">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-stone-400">
            Latest orders
          </h3>
          {data.recentOrders.length > 0 ? (
            <OrdersTable orders={data.recentOrders.slice(0, 5)} />
          ) : (
            <p className="py-8 text-center text-xs text-stone-600">
              No orders yet.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-stone-400">
            Best selling products
          </h3>

          {data.bestSellers.length === 0 ? (
            <p className="py-8 text-center text-xs text-stone-600">
              No sales recorded yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {data.bestSellers.map((seller, index) => (
                <li
                  key={seller.productId ?? seller.name}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-stone-800 text-xs font-bold text-stone-400">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-stone-200">{seller.name}</p>
                    <p className="text-[11px] tabular-nums text-stone-500">
                      {seller.quantity} sold · {formatCurrency(seller.revenue)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/admin/products"
            className="mt-6 block rounded-xl border border-stone-700 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-stone-300 transition-colors hover:border-amber-500/60 hover:text-amber-300"
          >
            Manage catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
