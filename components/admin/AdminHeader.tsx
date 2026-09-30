"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ExternalLink, LogOut, Menu, Store } from "lucide-react";
import { initials } from "@/lib/format";
import { adminNavItems } from "@/components/admin/AdminSidebar";

/**
 * Top bar: current section, storefront link and the sign-out control.
 * The hamburger only appears below `lg`, where the rail collapses into a drawer.
 */
export default function AdminHeader({
  adminName,
  adminEmail,
  onOpenMenu,
  onSignOut,
}: {
  adminName: string;
  adminEmail: string;
  onOpenMenu: () => void;
  onSignOut: () => void;
}) {
  const pathname = usePathname();
  const current =
    adminNavItems.find((item) => (item.match ? item.match(pathname) : pathname === item.href))
      ?.label ?? "Admin";

  return (
    <header className="sticky top-0 z-30 border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs uppercase tracking-[0.22em] text-stone-500">
            LUXE Admin
          </p>
          <p className="truncate font-heading text-lg font-semibold text-white">
            {current}
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="hidden items-center gap-2 rounded-full border border-stone-700 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-300 transition-colors hover:border-amber-500/60 hover:text-amber-300 sm:inline-flex"
        >
          <Store size={14} />
          Storefront
          <ExternalLink size={12} className="text-stone-500" />
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications — none yet"
            title="No notifications yet"
            className="relative rounded-full p-2 text-stone-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Bell size={17} />
          </button>
          <div className="hidden text-right sm:block">
            <p className="max-w-[10rem] truncate text-sm font-medium text-stone-200">
              {adminName}
            </p>
            <p className="max-w-[10rem] truncate text-[11px] text-stone-500">
              {adminEmail}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-stone-950 shadow-md">
            {initials(adminName || "LUXE")}
          </div>
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className="rounded-full p-2 text-stone-400 transition-all hover:bg-red-500/10 hover:text-red-400 active:scale-90"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
