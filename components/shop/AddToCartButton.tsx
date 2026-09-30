"use client";

import { Check, ShoppingCart } from "lucide-react";

/**
 * Shared "add to cart" control used by the product cards.
 *
 * Presentational on purpose: the owning grid owns the `added` feedback timer,
 * so the button stays reusable in server-rendered collections too.
 */
export default function AddToCartButton({
  productName,
  added = false,
  onAdd,
  size = "sm",
  className = "",
}: {
  productName: string;
  added?: boolean;
  onAdd: () => void;
  size?: "sm" | "lg";
  className?: string;
}) {
  const sizing =
    size === "lg"
      ? "px-6 py-3 text-sm"
      : "px-4 py-2.5 text-xs";

  return (
    <button
      type="button"
      aria-label={`Add ${productName} to cart`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onAdd();
      }}
      className={`inline-flex items-center gap-2 rounded-full font-semibold uppercase tracking-wider transition-all duration-300 active:scale-95 ${sizing} ${
        added
          ? "bg-emerald-500 text-white"
          : "bg-stone-900 text-white hover:bg-amber-500 dark:bg-white dark:text-stone-900 dark:hover:bg-amber-500 dark:hover:text-white"
      } ${className}`}
    >
      {added ? (
        <>
          <Check size={size === "lg" ? 16 : 14} />
          Added
        </>
      ) : (
        <>
          <ShoppingCart size={size === "lg" ? 16 : 14} />
          Add
        </>
      )}
    </button>
  );
}
