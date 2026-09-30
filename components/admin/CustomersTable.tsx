import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import type { CustomerRecord } from "@/lib/db/types";
import { formatCurrency, formatDate } from "@/lib/format";

/** Customer directory table for `/admin/customers` (server component). */
export default function CustomersTable({
  customers,
}: {
  customers: CustomerRecord[];
}) {
  if (customers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-700 px-6 py-14 text-center">
        <Users size={26} className="mx-auto mb-3 text-stone-600" />
        <p className="text-sm text-stone-400">No customers yet.</p>
        <p className="mt-1 text-xs text-stone-600">
          Customers are created automatically when an order is placed.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/60">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-800 text-[11px] uppercase tracking-[0.14em] text-stone-500">
              <th className="px-5 py-3.5 font-semibold">Customer</th>
              <th className="px-5 py-3.5 font-semibold">Phone</th>
              <th className="px-5 py-3.5 font-semibold">City</th>
              <th className="px-5 py-3.5 font-semibold">Orders</th>
              <th className="px-5 py-3.5 font-semibold">Total spent</th>
              <th className="px-5 py-3.5 font-semibold">Last order</th>
              <th className="px-5 py-3.5 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/70">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="transition-colors hover:bg-stone-800/40"
              >
                <td className="px-5 py-4">
                  <p className="font-medium text-white">{customer.name}</p>
                  <p className="text-xs text-stone-500">
                    {customer.email || "no email"}
                  </p>
                </td>
                <td className="px-5 py-4 tabular-nums text-stone-300">
                  {customer.phone}
                </td>
                <td className="px-5 py-4 text-stone-400">
                  {customer.city || "—"}
                </td>
                <td className="px-5 py-4 tabular-nums text-stone-300">
                  {customer.totalOrders}
                </td>
                <td className="px-5 py-4 font-semibold tabular-nums text-white">
                  {formatCurrency(customer.totalSpent)}
                </td>
                <td className="px-5 py-4 text-xs text-stone-400">
                  {formatDate(customer.lastOrderAt ?? customer.createdAt)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    aria-label={`Open ${customer.name}`}
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
