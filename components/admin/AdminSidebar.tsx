"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: Package,
    match: (p) => p.startsWith("/admin/orders"),
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Boxes,
    match: (p) => p.startsWith("/admin/products"),
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
    match: (p) => p.startsWith("/admin/customers"),
  },
  { label: "Analytics", href: "/admin/analytics", icon: TrendingUp },
];

function isActive(item: AdminNavItem, pathname: string): boolean {
  if (item.match) return item.match(pathname);
  return pathname === item.href;
}

/** Navigation list — shared by the desktop rail and the mobile drawer. */
export default function AdminSidebar({
  onNavigate,
}: {
  /** Called after a link is tapped (used by the mobile drawer to close). */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5">
      {adminNavItems.map((item) => {
        const active = isActive(item, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
              active
                ? "bg-gradient-to-r from-amber-500/20 to-transparent text-amber-300"
                : "text-stone-400 hover:bg-white/5 hover:text-stone-100"
            }`}
          >
            <span
              aria-hidden
              className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-amber-400 transition-all duration-300 ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />
            <item.icon
              size={17}
              className={
                active
                  ? "text-amber-400"
                  : "text-stone-500 transition-colors group-hover:text-stone-300"
              }
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
