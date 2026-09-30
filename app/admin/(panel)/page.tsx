import Link from "next/link";
import Image from "next/image";
import {
  Banknote,
  Package,
  Clock,
  Loader,
  Truck,
  CheckCircle2,
  Boxes,
  Users,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import OrdersTable from "@/components/admin/OrdersTable";
import RevenueChart from "@/components/admin/RevenueChart";
import { getAnalytics } from "@/lib/analytics/getAnalytics";
import { formatCurrency } from "@/lib/format";

/** Always fresh: the dashboard reflects the latest orders on every visit. */
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const data = await getAnalytics();

  const cards: Array<{
    label: string;
    value: number;
    icon: typeof Package;
    accent: "amber" | "emerald" | "sky" | "violet" | "rose";
    prefix?: "currency";
    hint?: string;
  }> = [
    {
      label: "Total revenue",
      value: data.totalRevenue,
      icon: Banknote,
      accent: "amber",
      prefix: "currency",
      hint: `${formatCurrency(data.revenueToday)} today`,
    },
    {
      label: "Total orders",
      value: data.totalOrders,
      icon: Package,
      accent: "sky",
      hint: `${data.revenueByDay.reduce((sum, day) => sum + day.orders, 0)} in the last 30 days`,
    },
    {
      label: "Pending",
      value: data.pendingOrders,
      icon: Clock,
      accent: "rose",
      hint: "awaiting confirmation",
    },
    {
      label: "Processing",
      value: data.processingOrders,
      icon: Loader,
      accent: "violet",
      hint: `${data.confirmedOrders} confirmed`,
    },
    {
      label: "Shipped",
      value: data.shippedOrders,
      icon: Truck,
      accent: "sky",
      hint: "in transit",
    },
    {
      label: "Delivered",
      value: data.deliveredOrders,
      icon: CheckCircle2,
      accent: "emerald",
      hint: `${formatCurrency(data.averageOrderValue)} avg. order`,
    },
    {
      label: "Products",
      value: data.totalProducts,
      icon: Boxes,
      accent: "amber",
      hint: `${data.activeProducts} active`,
    },
    {
      label: "Customers",
      value: data.totalCustomers,
      icon: Users,
      accent: "emerald",
      hint: "unique buyers",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-amber-500">
            Overview
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-white">
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            Live figures from the orders table ·{" "}
            <span
              className={
                data.dataSource === "supabase"
                  ? "text-emerald-400"
                  : "text-amber-400"
              }
            >
              {data.dataSource === "supabase" ? "Supabase" : "local store"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-950 transition-all hover:shadow-lg hover:shadow-amber-500/20"
          >
            Manage orders
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-full border border-stone-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-200 transition-colors hover:border-amber-500/60 hover:text-amber-300"
          >
            Add product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <StatsCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            accent={card.accent}
            prefix={card.prefix}
            hint={card.hint}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart data={data.revenueByDay} />
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-400">
              Best selling
            </h3>
            <Link
              href="/admin/analytics"
              className="text-[11px] font-medium text-amber-500 transition-colors hover:text-amber-400"
            >
              Analytics
            </Link>
          </div>

          {data.bestSellers.length === 0 ? (
            <p className="py-8 text-center text-xs text-stone-600">
              No sales recorded yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.bestSellers.map((seller, index) => (
                <li
                  key={seller.productId ?? seller.name}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-stone-800 text-[11px] font-bold text-stone-400">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-stone-200">
                    {seller.name}
                  </span>
                  <span className="text-xs tabular-nums text-stone-500">
                    {seller.quantity} sold
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-amber-400">
                    {formatCurrency(seller.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-400">
            Recent orders
          </h3>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-500 transition-colors hover:text-amber-400"
          >
            View all
            <ArrowRight size={12} />
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-700 px-6 py-14 text-center">
            <p className="text-sm text-stone-400">No orders yet.</p>
            <p className="mt-1 text-xs text-stone-600">
              Place a test order from{" "}
              <Link href="/shop" className="text-amber-500 hover:underline">
                the storefront
              </Link>{" "}
              to see it land here.
            </p>
          </div>
        ) : (
          <OrdersTable orders={data.recentOrders} />
        )}
      </div>

      {/* Low stock */}
      {data.lowStock.length > 0 && (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
          <div className="mb-4 flex items-center gap-2 text-amber-400">
            <AlertTriangle size={16} />
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em]">
              Low stock
            </h3>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.lowStock.map((product) => (
              <li key={product.id} className="flex items-center gap-3">
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-stone-800">
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="min-w-0 flex-1 truncate text-sm text-stone-200 transition-colors hover:text-amber-300"
                >
                  {product.name}
                </Link>
                <span className="text-xs font-bold tabular-nums text-amber-400">
                  {product.stockQuantity} left
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

