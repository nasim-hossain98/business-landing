"use client";

import { Check } from "lucide-react";
import { products } from "@/data/products";

export function getDefaultOption(productId: number): string {
  const product = products.find((p) => p.id === productId);
  return product?.options[0]?.values[0] ?? "";
}

export function getOptionLabel(productId: number): string {
  const product = products.find((p) => p.id === productId);
  return product?.options[0]?.label ?? "";
}

export default function ProductOptions({
  option,
  setOption,
  productId,
}: {
  option: string;
  setOption: (v: string) => void;
  productId: number;
}) {
  const product = products.find((p) => p.id === productId);
  const opt = product?.options[0];
  if (!opt) return null;

  return (
    <div className="mb-8">
      <h3 className="font-heading text-sm font-semibold text-stone-900 dark:text-white mb-3 uppercase tracking-wider">
        {opt.label}
      </h3>
      <div className="flex flex-wrap gap-2">
        {opt.values.map((val) => {
          const active = option === val;
          return (
            <button
              key={val}
              onClick={() => setOption(val)}
              className={`relative flex items-center justify-center rounded-xl border-2 px-5 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
                active
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-md shadow-amber-500/10"
                  : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600"
              }`}
            >
              {active && (
                <Check size={12} className="mr-1.5" />
              )}
              {val}
            </button>
          );
        })}
      </div>
    </div>
  );
}
