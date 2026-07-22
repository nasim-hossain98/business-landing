"use client";

import { Smartphone, Banknote } from "lucide-react";
import { useCart, type PaymentMethod } from "@/components/providers/CartContext";

const methods: { id: PaymentMethod; label: string; sub: string; color: string; icon: typeof Smartphone }[] = [
  {
    id: "bkash",
    label: "bKash",
    sub: "Pay via bKash mobile wallet",
    color: "from-pink-500 to-pink-600",
    icon: Smartphone,
  },
  {
    id: "nagad",
    label: "Nagad",
    sub: "Pay via Nagad mobile wallet",
    color: "from-orange-500 to-orange-600",
    icon: Smartphone,
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    sub: "Pay when you receive your order",
    color: "from-emerald-500 to-emerald-600",
    icon: Banknote,
  },
];

export default function PaymentMethodSelect() {
  const { state, setPaymentMethod } = useCart();

  return (
    <div className="rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-7">
      <h2 className="font-heading text-xl font-semibold text-stone-900 dark:text-white mb-6">
        Payment Method
      </h2>

      <div className="space-y-3">
        {methods.map((m) => {
          const active = state.paymentMethod === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setPaymentMethod(m.id)}
              className={`w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-300 ${
                active
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10 shadow-md shadow-amber-500/10"
                  : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 hover:border-stone-300 dark:hover:border-stone-600"
              }`}
            >
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${m.color} text-white shadow-lg`}>
                <m.icon size={20} />
              </div>
              <div className="flex-1">
                <span className={`text-sm font-semibold ${active ? "text-stone-900 dark:text-white" : "text-stone-700 dark:text-stone-300"}`}>
                  {m.label}
                </span>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{m.sub}</p>
              </div>
              <div className={`h-5 w-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                active
                  ? "border-amber-400 bg-amber-400"
                  : "border-stone-300 dark:border-stone-600"
              }`}>
                {active && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
