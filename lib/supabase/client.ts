import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (anon key only).
 *
 * Used by the admin panel for direct-to-Supabase Storage uploads of product
 * images, where the request is authorized by the admin's own session cookies
 * plus Storage RLS. Every database read/write still goes through the server
 * (see `lib/supabase/admin.ts` and the route handlers).
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return createBrowserClient(url, anonKey);
}
