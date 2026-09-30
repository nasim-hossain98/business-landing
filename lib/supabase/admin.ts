import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Service-role key. Read here (and nowhere else) so the value never travels
 * into shared/client modules.
 */
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * True when the service-role key is present as well. Admin reads/writes and
 * public order creation go through the service-role client so that Row Level
 * Security can stay completely closed to anonymous readers.
 */
export function isSupabaseAdminConfigured(): boolean {
  return isSupabaseConfigured() && Boolean(SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Service-role Supabase client.
 *
 * ⚠️ SERVER ONLY. This client bypasses Row Level Security, so it is used for:
 *   - creating orders from the public checkout (customers are anonymous)
 *   - order tracking lookups (order number + phone verification)
 *   - admin reads/writes after `requireAdmin()` has passed
 *   - image uploads into the `product-images` storage bucket
 *
 * The key never reaches the browser: this module is guarded by `server-only`.
 *
 * Returns `null` when Supabase is not configured, in which case the local
 * development store (`lib/db/memory.ts`) is used instead.
 */
export function createSupabaseAdminClient(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured()) return null;

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const PRODUCT_IMAGES_BUCKET = "product-images";
