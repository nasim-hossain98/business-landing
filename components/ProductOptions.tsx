"use client";

import { Check } from "lucide-react";
import type { ProductOption } from "@/lib/products/types";

/** First value of the first option group — the default selection on a card. */
export function getDefaultOption(options: ProductOption[] | undefined): string {
  return options?.[0]?.values[0] ?? "";
}

export default function ProductOptions({
  option,
  setOption,
  options,
}: {
  option: string;
  setOption: (v: string) => void;
  options: ProductOption[];
}) {
  const opt = options[0];
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
