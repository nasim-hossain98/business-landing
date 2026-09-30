import type { Metadata } from "next";

/**
 * `app/admin/layout.tsx` — admin-only shell.
 *
 * Route protection lives one level deeper in `app/admin/(panel)/layout.tsx`
 * (a route group) so `/admin/login` stays reachable without a session while
 * every other admin URL keeps its exact `/admin/...` path. The group boundary
 * is structural only — no URL segment is added.
 *
 * The admin area is also declared `noindex`: search engines must never crawl
 * the dashboard, and hiding the link is explicitly *not* how we secure it
 * (see `proxy.ts` + `requireAdmin()`).
 */
export const metadata: Metadata = {
  title: { default: "Admin — LUXE", template: "%s · LUXE Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">{children}</div>
  );
}
