"use client";

import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CreditCard, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartItemRow from "@/components/CartItem";
import CustomerInfoForm from "@/components/CustomerInfoForm";
import PaymentMethodSelect from "@/components/PaymentMethodSelect";
import CartSummary, { EmptyCartNotice } from "@/components/cart/CartSummary";
import { useCart } from "@/components/providers/CartContext";

export default function CartPage() {
  const { state, clearCart, totalItems } = useCart();
  const prefersReduced = useReducedMotion();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-white dark:bg-stone-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="py-6">
            <Link
              href="/shop"
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
            <EmptyCartNotice />
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
                  <CartSummary showPerks>
                    <Link
                      href="/checkout"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full btn-slide px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-100 tracking-wider uppercase"
                    >
                      <CreditCard size={18} />
                      Proceed to Checkout
                    </Link>
                  </CartSummary>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
