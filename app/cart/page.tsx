"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShoppingBag, CreditCard, ChevronLeft, Truck, Shield, RotateCcw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartItemRow from "@/components/CartItem";
import CustomerInfoForm from "@/components/CustomerInfoForm";
import PaymentMethodSelect from "@/components/PaymentMethodSelect";
import CheckoutModal from "@/components/CheckoutModal";
import { useCart } from "@/components/providers/CartContext";

const perks = [
  { icon: Truck, label: "Free Shipping", sub: "On orders over $50" },
  { icon: Shield, label: "Secure Payment", sub: "256-bit SSL encryption" },
  { icon: RotateCcw, label: "30-Day Returns", sub: "Hassle-free returns" },
];

export default function CartPage() {
  const { state, clearCart, totalItems, totalPrice } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const prefersReduced = useReducedMotion();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-white dark:bg-stone-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="py-6">
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-amber-500 transition-colors duration-300"
            >
              <ChevronLeft size={16} />
              Continue Shopping
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-stone-900 dark:text-white">
              Your Cart
            </h1>
            <p className="mt-2 text-stone-500 dark:text-stone-400">
              {totalItems === 0
                ? "Your cart is empty"
                : `${totalItems} ${totalItems === 1 ? "item" : "items"} in your cart`}
            </p>
          </div>

          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 mb-6">
                <ShoppingBag size={40} className="text-stone-400 dark:text-stone-500" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-stone-900 dark:text-white mb-2">
                Nothing here yet
              </h2>
              <p className="text-stone-500 dark:text-stone-400 mb-8 max-w-md">
                Looks like you haven&apos;t added anything to your cart. Browse our collection and find something you love.
              </p>
              <Link
                href="/#products"
                className="inline-flex items-center gap-2 rounded-full btn-slide px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 active:scale-100 tracking-wider uppercase"
              >
                <ShoppingBag size={18} />
                Browse Collection
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12 items-start">
                {/* Left: Cart Items + Info + Payment */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Cart Items */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
                        Cart Items
                      </h2>
                      <button
                        onClick={clearCart}
                        className="text-xs font-medium text-stone-400 hover:text-red-500 transition-colors duration-200 uppercase tracking-wider"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {state.items.map((item) => (
                          <motion.div
                            key={item.product.id}
                            layout
                            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <CartItemRow item={item} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <CustomerInfoForm />

                  {/* Payment Method */}
                  <PaymentMethodSelect />
                </div>

                {/* Right: Order Summary */}
                <div className="lg:sticky lg:top-32">
                  <div className="rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-7">
                    <h2 className="font-heading text-xl font-semibold text-stone-900 dark:text-white mb-6">
                      Order Summary
                    </h2>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-stone-600 dark:text-stone-400">
                        <span>Subtotal ({totalItems} items)</span>
                        <span className="font-semibold text-stone-900 dark:text-white tabular-nums">
                          ${totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-600 dark:text-stone-400">
                        <span>Shipping</span>
                        <span className="font-semibold text-emerald-500">
                          {totalPrice >= 50 ? "Free" : "$9.99"}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-600 dark:text-stone-400">
                        <span>Tax (estimated)</span>
                        <span className="font-semibold text-stone-900 dark:text-white tabular-nums">
                          ${(totalPrice * 0.08).toFixed(2)}
                        </span>
                      </div>
                      <div className="h-px bg-stone-200 dark:bg-stone-700 my-2" />
                      <div className="flex justify-between">
                        <span className="text-base font-semibold text-stone-900 dark:text-white">Total</span>
                        <span className="text-xl font-bold text-stone-900 dark:text-white tabular-nums">
                          ${(totalPrice + (totalPrice >= 50 ? 0 : 9.99) + totalPrice * 0.08).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowCheckout(true)}
                      className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full btn-slide px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-100 tracking-wider uppercase"
                    >
                      <CreditCard size={18} />
                      Proceed to Checkout
                    </button>

                    {totalPrice < 50 && (
                      <p className="mt-4 text-center text-xs text-stone-500 dark:text-stone-400">
                        Add ${(50 - totalPrice).toFixed(2)} more for free shipping
                      </p>
                    )}
                  </div>

                  {/* Perks */}
                  <div className="mt-6 space-y-3">
                    {perks.map((perk) => (
                      <div key={perk.label} className="flex items-center gap-3 text-sm">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500">
                          <perk.icon size={16} />
                        </div>
                        <div>
                          <span className="font-medium text-stone-900 dark:text-white">{perk.label}</span>
                          <span className="ml-1.5 text-stone-500 dark:text-stone-400">{perk.sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />

      <CheckoutModal open={showCheckout} onClose={() => setShowCheckout(false)} />
    </div>
  );
}
