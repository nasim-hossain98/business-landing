"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Search, ShoppingBag, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useCart } from "@/components/providers/CartContext";

const navLinks = [
  { label: "Shop", href: "/#products" },
  { label: "Categories", href: "/#categories" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Contact", href: "/#footer" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { totalItems } = useCart();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={prefersReduced ? {} : { y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-stone-900/70 dark:bg-stone-950/70 backdrop-blur-2xl shadow-xl shadow-black/10 border-b border-stone-800/50"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="group flex items-center gap-1.5"
          >
            <span className="text-3xl font-heading font-bold tracking-wide text-white transition-colors duration-300">
              LUXE
            </span>
            <span className="text-3xl font-heading font-bold text-amber-400 transition-all duration-300 group-hover:scale-150 group-hover:rotate-12 inline-block">
              .
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="relative text-sm font-medium tracking-wider text-stone-300 hover:text-amber-300 transition-colors duration-300 group uppercase"
                >
                  {link.label}
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-[1.5px] w-0 bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 rounded-full group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center rounded-full btn-slide px-5 py-2 text-xs font-semibold text-white shadow-md shadow-amber-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105 active:scale-95 tracking-wider uppercase"
            >
              Register
            </Link>
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="rounded-full p-2.5 text-stone-400 hover:bg-stone-800/80 hover:text-amber-400 transition-all duration-300 active:scale-90"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              aria-label="Search"
              className="rounded-full p-2.5 text-stone-400 hover:bg-stone-800/80 hover:text-amber-400 transition-all duration-300 active:scale-90"
            >
              <Search size={17} />
            </button>
            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="relative rounded-full p-2.5 text-stone-400 hover:bg-stone-800/80 hover:text-amber-400 transition-all duration-300 active:scale-90"
            >
              <ShoppingBag size={17} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-[9px] font-bold text-white shadow-lg">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-full p-2.5 text-stone-400 hover:bg-stone-800/80 transition-all duration-300 md:hidden active:scale-90"
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-stone-900/95 backdrop-blur-2xl shadow-2xl md:hidden border-l border-stone-700/50"
            >
              <div className="flex items-center justify-between p-6">
                <span className="text-2xl font-heading font-bold text-white">
                  LUXE<span className="text-amber-400">.</span>
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="rounded-full p-2.5 text-stone-400 hover:bg-stone-800 transition-all duration-300 active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={prefersReduced ? {} : { opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-xl px-4 py-3.5 text-base font-medium tracking-wider text-stone-300 hover:bg-gradient-to-r hover:from-amber-500/15 hover:to-transparent hover:text-amber-300 transition-all duration-300 uppercase"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="mt-3 block rounded-xl btn-slide px-4 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 uppercase tracking-wider"
                >
                  Register
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
