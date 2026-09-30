import { requireAdmin } from "@/lib/auth/admin";
import AdminShell from "@/components/admin/AdminShell";

/**
 * Admin layout for every signed-in admin page.
 *
 * This is the **server-side authorization gate**: `requireAdmin()` resolves the
 * session (Supabase Auth or the signed local cookie), verifies the account is
 * on the admin allow-list, and redirects to `/admin/login` otherwise. Client
 * checks are only ever an optimisation — `proxy.ts` does the optimistic
 * redirect and this layout does the real check.
 */
export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();

  return (
    <AdminShell adminName={session.name} adminEmail={session.email}>
      {children}
    </AdminShell>
  );
}
