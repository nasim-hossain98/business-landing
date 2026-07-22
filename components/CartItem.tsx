"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart, type CartItemType } from "@/components/providers/CartContext";

export default function CartItemRow({ item }: { item: CartItemType }) {
  const { increment, decrement, removeItem } = useCart();
  const { product, quantity } = item;

  return (
    <div className="flex gap-5 sm:gap-6 rounded-2xl bg-stone-50 dark:bg-stone-900 p-4 sm:p-5 transition-colors duration-300 hover:bg-stone-100 dark:hover:bg-stone-800/80">
      <Link
        href={`/product/${product.id}`}
        className="relative flex-shrink-0 h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-xl bg-stone-200 dark:bg-stone-800"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="112px"
          className="object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <Link
            href={`/product/${product.id}`}
            className="font-heading text-lg font-semibold text-stone-900 dark:text-white hover:text-amber-500 dark:hover:text-amber-400 transition-colors duration-300 line-clamp-1"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-widest text-amber-500">
            {product.category}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => decrement(product.id)}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors duration-200 active:scale-90"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-stone-900 dark:text-white tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => increment(product.id)}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors duration-200 active:scale-90"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-stone-900 dark:text-white tabular-nums">
              ${(product.price * quantity).toFixed(2)}
            </span>
            <button
              onClick={() => removeItem(product.id)}
              aria-label={`Remove ${product.name} from cart`}
              className="rounded-lg p-2 text-stone-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 active:scale-90"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
