import type { Metadata } from "next";
import { Search, Users } from "lucide-react";
import CustomersTable from "@/components/admin/CustomersTable";
import { getCustomers } from "@/lib/customers/getCustomers";
import StatsCard from "@/components/admin/StatsCard";

export const metadata: Metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

const field =
  "w-full rounded-xl border border-stone-700 bg-stone-800 px-3.5 py-2.5 text-sm text-white placeholder-stone-500 outline-none transition-colors focus:border-amber-500";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await getCustomers(q);

  const totalSpent = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0,
  );
  const withOrders = customers.filter((customer) => customer.totalOrders > 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-amber-500">
          Directory
        </p>
        <h1 className="mt-2 font-heading text-4xl font-bold text-white">
          Customers
        </h1>
        <p className="mt-1.5 text-sm text-stone-500">
          {customers.length} customer{customers.length === 1 ? "" : "s"} · phone
          numbers and addresses stay inside the admin area
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          label="Customers"
          value={customers.length}
          icon={Users}
          accent="sky"
          hint="unique buyers"
        />
        <StatsCard
          label="Lifetime value"
          value={totalSpent}
          icon={Users}
          accent="amber"
          prefix="currency"
          hint="all orders combined"
        />
        <StatsCard
          label="Average per buyer"
          value={withOrders.length ? Math.round(totalSpent / withOrders.length) : 0}
          icon={Users}
          accent="emerald"
          prefix="currency"
          hint="repeat buyers welcome"
        />
      </div>

      <form
        method="get"
        action="/admin/customers"
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
          />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by name, email or phone"
            className={`${field} pl-10`}
          />
        </div>
        <button
          type="submit"
          className="rounded-xl border border-stone-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-300 transition-colors hover:border-amber-500/60 hover:text-amber-300"
        >
          Search
        </button>
      </form>

      <CustomersTable customers={customers} />
    </div>
  );
}
