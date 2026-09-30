import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  ADMIN_SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "@/lib/auth/constants";
import { createLocalSessionToken, signInAdmin } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { asRecord, asString } from "@/lib/validation";

/**
 * POST /api/admin/auth/login
 *
 * The only way into the admin panel. There is **no** public admin
 * registration route: accounts are created by the business owner in the
 * Supabase dashboard (or via the local ADMIN_EMAIL/ADMIN_PASSWORD fallback
 * while Supabase is not yet connected).
 */

/* Simple in-process brute-force guard: 6 attempts per IP per 10 minutes. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 6;
const attempts = new Map<string, { count: number; first: number }>();

function throttleKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (forwarded?.split(",")[0] ?? request.headers.get("x-real-ip") ?? "local").trim();
}

function isThrottled(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string): void {
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: Date.now() });
    return;
  }
  entry.count += 1;
}

export async function POST(request: Request) {
  const key = throttleKey(request);
  if (isThrottled(key)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const record = asRecord(body);
  const email = asString(record.email);
  const password = typeof record.password === "string" ? record.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const result = await signInAdmin(email, password);
  if (!result.ok) {
    recordFailure(key);
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  attempts.delete(key);

  // Local (no-Supabase) mode keeps its own signed session cookie. In Supabase
  // mode the @supabase/ssr client has already written the session cookies.
  if (!isSupabaseConfigured() && result.session.source === "local") {
    const cookieStore = await cookies();
    cookieStore.set(
      ADMIN_SESSION_COOKIE,
      createLocalSessionToken(result.session.email),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_TTL_SECONDS,
      },
    );
  }

  return NextResponse.json({
    ok: true,
    admin: { email: result.session.email, name: result.session.name },
  });
}
