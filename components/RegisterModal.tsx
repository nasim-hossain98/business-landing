"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, User, Store } from "lucide-react";

export default function RegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800"
          >
            <div className="flex items-center justify-between p-7 pb-0">
              <h2 className="font-heading text-xl font-semibold text-stone-900 dark:text-white">
                Choose Registration Type
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-600 dark:hover:text-stone-300 transition-all duration-200 active:scale-90"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-7 pt-5 space-y-4">
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                Select how you want to use LUXE:
              </p>

              <Link
                href="/register?role=customer"
                onClick={onClose}
                className="flex items-center gap-4 rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 p-5 text-left transition-all duration-300 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:shadow-lg hover:shadow-amber-500/10 group"
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg">
                  <User size={24} />
                </div>
                <div className="flex-1">
                  <span className="block text-sm font-semibold text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    Register as a Customer
                  </span>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                    Shop products, track orders, save favorites
                  </p>
                </div>
              </Link>

              <Link
                href="/register?role=vendor"
                onClick={onClose}
                className="flex items-center gap-4 rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 p-5 text-left transition-all duration-300 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:shadow-lg hover:shadow-amber-500/10 group"
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg">
                  <Store size={24} />
                </div>
                <div className="flex-1">
                  <span className="block text-sm font-semibold text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    Register as a Vendor
                  </span>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                    Sell products, manage inventory, grow your business
                  </p>
                </div>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
