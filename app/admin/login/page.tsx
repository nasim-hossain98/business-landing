import { AlertTriangle, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getAdminSession, isAuthenticatedNonAdmin } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * /admin/login — the only public admin route.
 *
 * There is no registration screen by design: accounts are created by the
 * business owner (Supabase dashboard → `admin_users`, or `ADMIN_EMAIL` /
 * `ADMIN_PASSWORD` while Supabase is not connected).
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const params = await searchParams;
  const forbidden =
    params.error === "forbidden" || (await isAuthenticatedNonAdmin());
  const next =
    params.next && params.next.startsWith("/admin") && !params.next.startsWith("/admin/login")
      ? params.next
      : "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="font-heading text-4xl font-bold text-white">
              LUXE<span className="text-amber-400">.</span>
            </span>
          </Link>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-amber-500">
            Admin Panel
          </p>
        </div>

        {forbidden && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            <ShieldAlert size={18} className="mt-0.5 flex-shrink-0" />
            <p>
              Your account signed in successfully but is{" "}
              <span className="font-semibold">not on the admin allow-list</span>.
              Ask the store owner to add you.
            </p>
          </div>
        )}

        <div className="rounded-3xl border border-stone-800 bg-stone-900/70 p-8 shadow-2xl shadow-black/40">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950">
              <Lock size={18} />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold text-white">
                Sign in
              </h1>
              <p className="text-xs text-stone-400">
                Owner &amp; staff accounts only
              </p>
            </div>
          </div>

          <AdminLoginForm next={next} />

          {!isSupabaseConfigured() && (
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-stone-700 bg-stone-800/60 p-3 text-[11px] leading-relaxed text-stone-400">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-amber-400" />
              <p>
                Supabase is not configured, so sign-in uses the local owner
                account from <code className="text-amber-300">ADMIN_EMAIL</code> /{" "}
                <code className="text-amber-300">ADMIN_PASSWORD</code>. Connect
                Supabase for real accounts.
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-stone-500">
          <Link href="/" className="transition-colors hover:text-amber-400">
            ← Back to storefront
          </Link>
        </p>
      </div>
    </div>
  );
}
