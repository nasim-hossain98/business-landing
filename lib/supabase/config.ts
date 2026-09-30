/* ------------------------------------------------------------------
   Supabase environment configuration
   ------------------------------------------------------------------
   Contains the *public* project URL and anon key only. The service-role key
   is read exclusively inside `lib/supabase/admin.ts`, which is guarded by
   `server-only`.
   ------------------------------------------------------------------ */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * True when the public Supabase project URL + anon key are present.
 *
 * When this is `false` the app switches to the local development store
 * (`lib/db/local-store.ts`) so the full order lifecycle can still be exercised
 * without credentials. See README → "Local development without Supabase".
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Public Supabase project host, used by `next.config.ts` for remote images. */
export function supabaseHostname(): string | null {
  if (!SUPABASE_URL) return null;
  try {
    return new URL(SUPABASE_URL).hostname;
  } catch {
    return null;
  }
}
