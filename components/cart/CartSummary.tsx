"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Truck, Shield, RotateCcw, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/CartContext";
import { calcTotals, FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";
import { formatCurrency } from "@/lib/format";

const perks = [
  { icon: Truck, label: "Free Shipping", sub: "On qualifying orders" },
  { icon: Shield, label: "Secure Checkout", sub: "Server-verified pricing" },
  { icon: RotateCcw, label: "30-Day Returns", sub: "Hassle-free returns" },
];

/**
 * Shared cart/order totals panel.
 *
 * Used by /cart and /checkout so the customer sees exactly the numbers that
 * `lib/orders/createOrder.ts` will compute on the server — both call
 * `calcTotals()` from lib/pricing.ts. The client total is a preview only; the
 * server recalculates everything from the database.
 */
export default function CartSummary({
  title = "Order Summary",
  showItems = false,
  showPerks = false,
  children,
  className = "",
}: {
  title?: string;
  showItems?: boolean;
  showPerks?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const { state, totalItems, totalPrice } = useCart();
  const totals = calcTotals(totalPrice);
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - totals.subtotal,
  );

  return (
    <div className={`space-y-5 ${className}`}>
      <div className="rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-7">
        <h2 className="font-heading text-xl font-semibold text-stone-900 dark:text-white mb-6">
          {title}
        </h2>

        {showItems && (
          <ul className="mb-6 space-y-4">
            {state.items.map((item) => (
              <li
                key={`${item.product.id}-${item.selectedOption}`}
                className="flex items-center gap-4"
              >
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-stone-200 dark:bg-stone-800">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-900 dark:text-white">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {item.quantity} × {formatCurrency(item.product.price)}
                    {item.selectedOption ? ` · ${item.selectedOption}` : ""}
                  </p>
                </div>
                <span className="text-sm font-semibold text-stone-900 dark:text-white tabular-nums">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-stone-600 dark:text-stone-400">
            <span>Subtotal ({totalItems} items)</span>
            <span className="font-semibold text-stone-900 dark:text-white tabular-nums">
              {formatCurrency(totals.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-stone-600 dark:text-stone-400">
            <span>Shipping</span>
            <span
              className={
                totals.shipping === 0
                  ? "font-semibold text-emerald-500"
                  : "font-semibold text-stone-900 dark:text-white tabular-nums"
              }
            >
              {totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}
            </span>
          </div>
          <div className="h-px bg-stone-200 dark:bg-stone-700 my-2" />
          <div className="flex justify-between items-baseline">
            <span className="text-base font-semibold text-stone-900 dark:text-white">
              Total
            </span>
            <span className="text-xl font-bold text-stone-900 dark:text-white tabular-nums">
              {formatCurrency(totals.total)}
            </span>
          </div>
        </div>

        {children && <div className="mt-7">{children}</div>}

        {remainingForFreeShipping > 0 && (
          <p className="mt-4 text-center text-xs text-stone-500 dark:text-stone-400">
            Add {formatCurrency(remainingForFreeShipping)} more for free shipping
          </p>
        )}
      </div>

      {showPerks && (
        <div className="space-y-3">
          {perks.map((perk) => (
            <div key={perk.label} className="flex items-center gap-3 text-sm">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500">
                <perk.icon size={16} />
              </div>
              <div>
                <span className="font-medium text-stone-900 dark:text-white">
                  {perk.label}
                </span>
                <span className="ml-1.5 text-stone-500 dark:text-stone-400">
                  {perk.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Empty-cart call to action shared by /cart and /checkout. */
export function EmptyCartNotice({ href = "/shop" }: { href?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 mb-6">
        <ShoppingBag
          size={40}
          className="text-stone-400 dark:text-stone-500"
        />
      </div>
      <h2 className="font-heading text-2xl font-semibold text-stone-900 dark:text-white mb-2">
        Nothing here yet
      </h2>
      <p className="text-stone-500 dark:text-stone-400 mb-8 max-w-md">
        Looks like you haven&apos;t added anything to your cart. Browse our
        collection and find something you love.
      </p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-full btn-slide px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 active:scale-100 tracking-wider uppercase"
      >
        <ShoppingBag size={18} />
        Browse Collection
      </Link>
    </div>
  );
}
