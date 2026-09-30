"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, ShieldCheck, Settings, LogOut } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminMobileNav from "@/components/admin/AdminMobileNav";

/**
 * Admin chrome: fixed rail (lg+), sticky header, drawer (<lg) and the main
 * content column. Deliberately unlike the public site — no hero, no scroll
 * animations, no Lenis — so dense tables stay fast and readable.
 */
export default function AdminShell({
  adminName,
  adminEmail,
  children,
}: {
  adminName: string;
  adminEmail: string;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Network hiccup — still fall through to the login screen.
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <AdminMobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-stone-800/80 bg-stone-950 lg:flex">
        <div className="px-5 py-6">
          <Link href="/admin" className="block">
            <span className="font-heading text-3xl font-bold text-white">
              LUXE<span className="text-amber-400">.</span>
            </span>
            <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500">
              Admin
            </span>
          </Link>
          <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
            Orders, catalogue &amp; customers
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <AdminSidebar />
        </div>

        <div className="space-y-1 border-t border-stone-800/80 p-4">
          <button
            type="button"
            disabled
            title="Settings — coming soon"
            className="flex w-full cursor-not-allowed items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-stone-600"
          >
            <Settings size={15} />
            Settings
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-stone-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={15} />
            Logout
          </button>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-stone-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Store size={15} />
            View storefront
          </Link>
          <p className="flex items-center gap-2 px-3 pt-1 text-[11px] text-stone-600">
            <ShieldCheck size={13} className="text-emerald-500/70" />
            Server-side protected
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <AdminHeader
          adminName={adminName}
          adminEmail={adminEmail}
          onOpenMenu={() => setMenuOpen(true)}
          onSignOut={handleSignOut}
        />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
