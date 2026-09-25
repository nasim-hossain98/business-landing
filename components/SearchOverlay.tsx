"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, X, Package } from "lucide-react";
import Image from "next/image";
import { products } from "@/data/products";
import type { Product } from "@/data/products";

export default function SearchOverlay({ scrolled = true }: { scrolled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className={`rounded-full p-2.5 transition-all duration-300 active:scale-90 ${
          scrolled
            ? "text-stone-300 hover:bg-white/10 hover:text-amber-400"
            : "text-stone-600 hover:bg-stone-900/5 hover:text-amber-600"
        }`}
      >
        <Search size={17} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 top-[15%] z-[101] max-w-2xl mx-auto"
            >
              <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-200 dark:border-stone-800">
                  <Search size={20} className="text-stone-400 dark:text-stone-500 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 bg-transparent text-base text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 outline-none"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="rounded-full p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-stone-200 dark:border-stone-700 px-2 py-0.5 text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase">
                    <span>ctrl</span>
                    <span>k</span>
                  </kbd>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 mb-4">
                        <Package size={28} className="text-stone-400 dark:text-stone-500" />
                      </div>
                      <p className="text-stone-500 dark:text-stone-400">
                        {query.trim()
                          ? `No results found for "${query}"`
                          : "Start typing to search products"}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                      {filtered.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors duration-200"
                        >
                          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-900 dark:text-white truncate">
                              {product.name}
                            </p>
                            <p className="mt-0.5 text-xs font-medium uppercase tracking-widest text-amber-500">
                              {product.category}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-stone-900 dark:text-white tabular-nums">
                            ৳{product.price.toFixed(2)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
