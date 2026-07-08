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

/**
 * Footer — newsletter signup with focus animation, social links,
 * quick links, help links, and copyright. Includes back-to-top button.
 */
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
      className="bg-zinc-900 dark:bg-zinc-950 text-white"
    >
      {/* Newsletter section */}
      <div className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <AnimatedSection className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
              Stay Updated
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">
              Subscribe to Our Newsletter
            </h2>
            <p className="mt-4 text-zinc-400 max-w-lg mx-auto">
              Get the latest drops, exclusive deals, and style tips delivered
              straight to your inbox.
            </p>

            {/* Email form */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 mx-auto flex max-w-md gap-3"
            >
              <div className="relative flex-1">
                <motion.div
                  animate={
                    focused
                      ? { boxShadow: "0 0 0 3px rgba(245,158,11,0.3)" }
                      : { boxShadow: "0 0 0 0px rgba(245,158,11,0)" }
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
                    className="w-full rounded-full bg-zinc-800 border border-zinc-700 px-6 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </motion.div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/25 active:scale-95"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Subscribe</span>
              </button>
            </form>

            {/* Success message */}
            {subscribed && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm text-emerald-400"
              >
                ✓ Thanks for subscribing!
              </motion.p>
            )}
          </AnimatedSection>
        </div>
      </div>

      {/* Footer grid */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <a
              href="#"
              className="text-2xl font-heading font-bold tracking-tight"
            >
              LUXE<span className="text-amber-500">.</span>
            </a>
            <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
              Premium clothing, bags, and accessories for those who appreciate
              quality and timeless design.
            </p>
            {/* Social links */}
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-all duration-300 hover:bg-amber-500 hover:text-white hover:shadow-lg hover:shadow-amber-500/25"
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-amber-500"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Help
            </h4>
            <ul className="mt-4 space-y-3">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-amber-500"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Contact
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-zinc-400">
              <li>hello@luxestore.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Fashion Ave, New York, NY 10001</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 sm:flex-row">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} LUXE. All rights reserved.
          </p>

          {/* Back to top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-all duration-300 hover:bg-amber-500 hover:text-white hover:border-amber-500"
          >
            <ArrowUp size={14} />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
