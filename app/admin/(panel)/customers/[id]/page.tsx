import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, Mail, MapPin, Phone, Receipt } from "lucide-react";
import OrdersTable from "@/components/admin/OrdersTable";
import StatsCard from "@/components/admin/StatsCard";
import { getCustomerWithOrders } from "@/lib/customers/getCustomers";
import { formatDate } from "@/lib/format";
import { Package, Users } from "lucide-react";

export const metadata: Metadata = { title: "Customer" };
export const dynamic = "force-dynamic";

/** /admin/customers/[id] — profile + complete order history. */
export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCustomerWithOrders(id);
  if (!data) notFound();

  const { customer, orders } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/customers"
            aria-label="Back to customers"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-700 text-stone-400 transition-colors hover:border-amber-500/60 hover:text-amber-300"
          >
            <ChevronLeft size={16} />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-amber-500">
              Customer
            </p>
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              {customer.name}
            </h1>
            <p className="text-xs text-stone-500">
              Since {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          label="Total orders"
          value={customer.totalOrders}
          icon={Package}
          accent="sky"
          hint="excludes cancelled"
        />
        <StatsCard
          label="Total spent"
          value={customer.totalSpent}
          icon={Receipt}
          accent="amber"
          prefix="currency"
          hint="lifetime value"
        />
        <StatsCard
          label="Last order"
          value={customer.lastOrderAt ? formatDate(customer.lastOrderAt) : "—"}
          icon={Users}
          accent="emerald"
          hint="most recent purchase"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Contact
            </h2>
            <ul className="space-y-3 text-sm text-stone-300">
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="text-amber-500/80" />
                <span className="tabular-nums">{customer.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="text-amber-500/80" />
                <span className="truncate">{customer.email || "—"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 flex-shrink-0 text-amber-500/80" />
                <span>
                  {customer.address || "No address on file"}
                  {customer.city ? `, ${customer.city}` : ""}
                  {customer.postalCode ? ` · ${customer.postalCode}` : ""}
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 text-xs leading-relaxed text-stone-500">
            <p className="mb-2 flex items-center gap-2 font-semibold uppercase tracking-wider text-stone-400">
              <Receipt size={13} />
              Privacy
            </p>
            <p>
              This information is only reachable behind{" "}
              <code className="text-amber-400">requireAdmin()</code> — customers
              can never list or read other customers through the public API.
            </p>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-400">
            Order history ({orders.length})
          </h2>
          <OrdersTable orders={orders} />
        </div>
      </div>
    </div>
  );
}
