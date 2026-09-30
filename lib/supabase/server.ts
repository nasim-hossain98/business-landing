import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

/**
 * Cookie-bound Supabase client for Server Components, Server Actions, Proxy
 * and Route Handlers.
 *
 * It carries the *admin user's* session only — it never uses the service-role
 * key, so every query it makes is still filtered by Row Level Security.
 *
 * Returns `null` when Supabase is not configured so callers can fall back to
 * the local development store instead of throwing at build time.
 */
export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render: cookies are read-only there.
          // The Proxy refreshes the session instead, so this is safe to ignore.
        }
      },
    },
  });
}

/** The current authenticated Supabase user, or `null`. Never throws. */
export async function getSupabaseUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user ?? null;
  } catch {
    return null;
  }
}
