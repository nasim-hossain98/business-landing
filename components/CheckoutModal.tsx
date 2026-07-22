"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, MapPin, Smartphone, Banknote, CheckCircle2, Package } from "lucide-react";
import { useCart, type PaymentMethod } from "@/components/providers/CartContext";

const paymentLabels: Record<PaymentMethod, { label: string; icon: typeof Smartphone; color: string }> = {
  bkash: { label: "bKash", icon: Smartphone, color: "text-pink-500" },
  nagad: { label: "Nagad", icon: Smartphone, color: "text-orange-500" },
  cod: { label: "Cash on Delivery", icon: Banknote, color: "text-emerald-500" },
};

export default function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, totalItems, totalPrice, clearCart } = useCart();
  const [confirmed, setConfirmed] = useState(false);

  const shipping = totalPrice >= 50 ? 0 : 9.99;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shipping + tax;
  const pay = paymentLabels[state.paymentMethod];

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      clearCart();
      setConfirmed(false);
      onClose();
    }, 2500);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800"
          >
            {confirmed ? (
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
                >
                  <CheckCircle2 size={72} className="text-emerald-500 mb-6" />
                </motion.div>
                <h2 className="font-heading text-2xl font-bold text-stone-900 dark:text-white mb-2">
                  Order Confirmed!
                </h2>
                <p className="text-stone-500 dark:text-stone-400 text-sm">
                  Thank you for your purchase. We&apos;ll contact you shortly.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-7 pb-0">
                  <h2 className="font-heading text-xl font-semibold text-stone-900 dark:text-white">
                    Confirm Your Order
                  </h2>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-600 dark:hover:text-stone-300 transition-all duration-200 active:scale-90"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-7 space-y-6">
                  {/* Items */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-3">
                      Items ({totalItems})
                    </h3>
                    <div className="space-y-3">
                      {state.items.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-900 dark:text-white truncate">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-stone-900 dark:text-white tabular-nums">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-stone-200 dark:bg-stone-700" />

                  {/* Delivery Info */}
                  <div>
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-3">
                      <MapPin size={13} />
                      Delivery Address
                    </h3>
                    {state.customer.fullName ? (
                      <div className="rounded-xl bg-stone-50 dark:bg-stone-800/50 p-4 text-sm space-y-1">
                        <p className="font-medium text-stone-900 dark:text-white">{state.customer.fullName}</p>
                        <p className="text-stone-600 dark:text-stone-400">{state.customer.phone}</p>
                        {state.customer.email && (
                          <p className="text-stone-600 dark:text-stone-400">{state.customer.email}</p>
                        )}
                        <p className="text-stone-600 dark:text-stone-400">
                          {state.customer.address}, {state.customer.city}
                        </p>
                        {state.customer.notes && (
                          <p className="text-stone-500 dark:text-stone-500 text-xs italic mt-1">
                            Note: {state.customer.notes}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-stone-400 dark:text-stone-500 italic">
                        No delivery information saved yet.
                      </p>
                    )}
                  </div>

                  <div className="h-px bg-stone-200 dark:bg-stone-700" />

                  {/* Payment */}
                  <div>
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-3">
                      <pay.icon size={13} />
                      Payment Method
                    </h3>
                    <div className="flex items-center gap-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 p-4">
                      <pay.icon size={20} className={pay.color} />
                      <span className="text-sm font-semibold text-stone-900 dark:text-white">{pay.label}</span>
                    </div>
                  </div>

                  <div className="h-px bg-stone-200 dark:bg-stone-700" />

                  {/* Total */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-stone-600 dark:text-stone-400">
                      <span>Subtotal</span>
                      <span className="tabular-nums">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-600 dark:text-stone-400">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? "text-emerald-500 font-medium" : "tabular-nums"}>
                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-600 dark:text-stone-400">
                      <span>Tax</span>
                      <span className="tabular-nums">${tax.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-stone-200 dark:bg-stone-700 my-1" />
                    <div className="flex justify-between">
                      <span className="text-base font-bold text-stone-900 dark:text-white">Total</span>
                      <span className="text-lg font-bold text-stone-900 dark:text-white tabular-nums">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Confirm */}
                  <button
                    onClick={handleConfirm}
                    disabled={!state.customer.fullName}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full btn-slide px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-100 tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Package size={18} />
                    Confirm Buy — ${total.toFixed(2)}
                  </button>

                  {!state.customer.fullName && (
                    <p className="text-center text-xs text-stone-400 dark:text-stone-500">
                      Please save your delivery information before confirming.
                    </p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
