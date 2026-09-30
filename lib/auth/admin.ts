import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";

import {
  createSupabaseServerClient,
  getSupabaseUser,
} from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  ADMIN_SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "@/lib/auth/constants";

/* ------------------------------------------------------------------
   ADMIN AUTHENTICATION + AUTHORIZATION  (server only)

   Two modes:

   1. Supabase mode (normal): the admin signs in with Supabase Auth; the
      session lives in cookies managed by @supabase/ssr and is refreshed by
      `proxy.ts`. Authorization = `app_metadata.role === "admin"` OR a row in
      the `admin_users` table.

   2. Local mode (no Supabase credentials): a single owner account supplied
      through ADMIN_EMAIL / ADMIN_PASSWORD, kept in an HMAC-signed httpOnly
      cookie. Developer convenience only — see README.

   There is deliberately no admin registration route.
   ------------------------------------------------------------------ */

export const ADMIN_SESSION_COOKIE_NAME = ADMIN_SESSION_COOKIE;

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  source: "supabase" | "local";
};

export function isAdminConfigured(): boolean {
  if (isSupabaseConfigured()) return true;
  return Boolean(localAdminEmail() && localAdminPassword() && sessionSecret());
}

function localAdminEmail(): string | undefined {
  return process.env.ADMIN_EMAIL?.trim() || undefined;
}

function localAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD || undefined;
}

function sessionSecret(): string | undefined {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    (process.env.NODE_ENV === "production" ? undefined : "luxe-local-dev-secret")
  );
}

/* ------------------------------------------------------------------
   Local (fallback) session signing
   ------------------------------------------------------------------ */

function sign(payload: string): string {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function createLocalSessionToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Date.now() + SESSION_TTL_SECONDS * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readLocalSessionToken(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  try {
    if (!safeEqual(signature, sign(payload))) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      email?: string;
      exp?: number;
    };
    if (!parsed.email || !parsed.exp || parsed.exp < Date.now()) return null;
    return {
      id: `local-admin:${parsed.email}`,
      email: parsed.email,
      name: "Store Owner",
      source: "local",
    };
  } catch {
    return null;
  }
}

/** Verifies the owner credentials supplied through env vars. */
export function verifyLocalAdminCredentials(
  email: string,
  password: string,
): boolean {
  const expectedEmail = localAdminEmail();
  const expectedPassword = localAdminPassword();
  if (!expectedEmail || !expectedPassword) return false;

  return (
    safeEqual(email.trim().toLowerCase(), expectedEmail.toLowerCase()) &&
    safeEqual(password, expectedPassword)
  );
}

/* ------------------------------------------------------------------
   Supabase authorization
   ------------------------------------------------------------------ */

/**
 * An account is an admin when either:
 *   - `app_metadata.role === "admin"` (set by the business owner in the
 *     Supabase dashboard / with the SQL in migration 005), or
 *   - the user id exists in the `admin_users` allow-list table.
 */
async function isAdminUser(user: User): Promise<boolean> {
  const role = (user.app_metadata as { role?: string } | undefined)?.role;
  if (role === "admin") return true;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    // Table missing or unreachable → fail closed, never open.
    console.error("[auth] admin_users lookup failed:", error.message);
    return false;
  }
  return Boolean(data);
}

/* ------------------------------------------------------------------
   Session resolution
   ------------------------------------------------------------------ */

/**
 * Current admin session, or `null`.
 * Memoised per request so a page + layout + API call share one lookup.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  if (isSupabaseConfigured()) {
    const user = await getSupabaseUser();
    if (!user) return null;
    if (!(await isAdminUser(user))) return null;

    return {
      id: user.id,
      email: user.email ?? "",
      name:
        (user.user_metadata as { full_name?: string } | undefined)?.full_name ??
        user.email ??
        "Admin",
      source: "supabase",
    };
  }

  const cookieStore = await cookies();
  return readLocalSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
});

/** True when a signed-in user exists but is not authorized as an admin. */
export async function isAuthenticatedNonAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const user = await getSupabaseUser();
  if (!user) return false;
  return !(await isAdminUser(user));
}

/**
 * Page/layout guard. Redirects to `/admin/login` when there is no authorized
 * admin session — this is the server-side gate for every `/admin` route.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (session) return session;

  if (await isAuthenticatedNonAdmin()) {
    redirect("/admin/login?error=forbidden");
  }
  redirect("/admin/login");
}

/**
 * API guard. Returns a discriminator instead of redirecting so route handlers
 * can answer with 401/403 JSON.
 */
export async function requireAdminApi(): Promise<
  { authorized: true; session: AdminSession } | { authorized: false; status: number }
> {
  const session = await getAdminSession();
  if (session) return { authorized: true, session };

  if (await isAuthenticatedNonAdmin()) {
    return { authorized: false, status: 403 };
  }
  return { authorized: false, status: 401 };
}

/* ------------------------------------------------------------------
   Sign in / sign out (used by the route handlers)
   ------------------------------------------------------------------ */

export async function signInAdmin(
  email: string,
  password: string,
): Promise<{ ok: true; session: AdminSession } | { ok: false; error: string }> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return { ok: false, error: "Supabase is not configured." };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) {
      return { ok: false, error: "Invalid email or password." };
    }

    if (!(await isAdminUser(data.user))) {
      // Authenticated but not an admin → drop the session immediately.
      await supabase.auth.signOut();
      return {
        ok: false,
        error: "This account is not authorized to access the admin panel.",
      };
    }

    return {
      ok: true,
      session: {
        id: data.user.id,
        email: data.user.email ?? email,
        name:
          (data.user.user_metadata as { full_name?: string } | undefined)
            ?.full_name ?? email,
        source: "supabase",
      },
    };
  }

  if (!isAdminConfigured()) {
    return {
      ok: false,
      error:
        "Admin sign-in is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_SESSION_SECRET (or connect Supabase).",
    };
  }

  if (!verifyLocalAdminCredentials(email, password)) {
    return { ok: false, error: "Invalid email or password." };
  }

  return {
    ok: true,
    session: {
      id: `local-admin:${email.trim()}`,
      email: email.trim(),
      name: "Store Owner",
      source: "local",
    },
  };
}

export async function signOutAdmin(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut();
  }

  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

