"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Globe, AtSign, Share2, Send, ArrowUp } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

const quickLinks = [
  { label: "Home", href: "#" },
  { label: "Shop", href: "#products" },
  { label: "Categories", href: "#categories" },
  { label: "Reviews", href: "#reviews" },
];

const helpLinks = [
  { label: "FAQ", href: "#" },
  { label: "Shipping", href: "#" },
  { label: "Returns", href: "#" },
  { label: "Privacy Policy", href: "#" },
];

const socials = [
  { icon: Globe, label: "Website", href: "#" },
  { icon: AtSign, label: "Email", href: "#" },
  { icon: Share2, label: "Share", href: "#" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const prefersReduced = useReducedMotion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer
      id="footer"
      className="bg-stone-900 dark:bg-stone-950 text-white"
    >
      <div className="border-b border-stone-800/70">
        <div className="mx-auto max-w-7xl px-6 py-18 sm:py-22">
          <AnimatedSection className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
              Stay Updated
            </p>
            <h2 className="mt-4 font-heading text-4xl font-bold sm:text-5xl">
              Subscribe to Our Newsletter
            </h2>
            <p className="mt-4 text-stone-400 max-w-lg mx-auto text-base leading-relaxed">
              Get the latest drops, exclusive deals, and style tips delivered
              straight to your inbox.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-10 mx-auto flex max-w-md gap-3"
            >
              <div className="relative flex-1">
                <motion.div
                  animate={
                    focused
                      ? { boxShadow: "0 0 0 3px rgba(217,119,6,0.25)" }
                      : { boxShadow: "0 0 0 0px rgba(217,119,6,0)" }
                  }
                  className="rounded-full"
                >
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    required
                    className="w-full rounded-full bg-stone-800/80 border border-stone-700/60 px-6 py-3.5 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500/50 transition-all duration-300"
                  />
                </motion.div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full btn-slide px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 active:scale-95 tracking-wider uppercase"
              >
                <Send size={14} />
                <span className="hidden sm:inline">Subscribe</span>
              </button>
            </form>

            {subscribed && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 text-sm text-emerald-400"
              >
                ✓ Thanks for subscribing!
              </motion.p>
            )}
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 sm:py-18">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a
              href="#"
              className="group inline-flex items-center gap-1.5"
            >
              <span className="text-3xl font-heading font-bold tracking-wide text-white">
                LUXE
              </span>
              <span className="text-3xl font-heading font-bold text-amber-400 transition-all duration-300 group-hover:scale-150 group-hover:rotate-12 inline-block">.</span>
            </a>
            <p className="mt-5 text-sm text-stone-400 leading-relaxed max-w-xs">
              Premium clothing, bags, and accessories for those who appreciate
              quality and timeless design.
            </p>
            <div className="mt-6 flex gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800/80 text-stone-400 transition-all duration-300 hover:bg-amber-500 hover:text-white hover:shadow-lg hover:shadow-amber-500/25 active:scale-90"
                >
                  <s.icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-[0.15em] text-stone-300">
              Quick Links
            </h4>
            <ul className="mt-6 space-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-stone-400 transition-colors duration-300 hover:text-amber-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-[0.15em] text-stone-300">
              Help
            </h4>
            <ul className="mt-6 space-y-3.5">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-stone-400 transition-colors duration-300 hover:text-amber-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-[0.15em] text-stone-300">
              Contact
            </h4>
            <ul className="mt-6 space-y-3.5 text-sm text-stone-400">
              <li className="hover:text-stone-300 transition-colors cursor-default">hello@luxestore.com</li>
              <li className="hover:text-stone-300 transition-colors cursor-default">+1 (555) 123-4567</li>
              <li className="hover:text-stone-300 transition-colors cursor-default leading-relaxed">123 Fashion Ave, New York, NY 10001</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-stone-800/70 pt-8 sm:flex-row">
          <p className="text-sm text-stone-500">
            © {new Date().getFullYear()} LUXE. All rights reserved.
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="group inline-flex items-center gap-2 rounded-full border border-stone-700/60 px-5 py-2.5 text-sm text-stone-400 transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:text-white hover:border-amber-500 active:scale-95 tracking-wider uppercase"
          >
            <ArrowUp size={13} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
