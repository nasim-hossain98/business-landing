import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_SESSION_COOKIE,
  isPublicAdminPath,
} from "@/lib/auth/constants";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

/**
 * Proxy (Next.js 16's replacement for middleware — see AGENTS.md).
 *
 * Responsibility: an **optimistic** gate for `/admin/*` plus Supabase session
 * refresh. It is deliberately not the authorization layer: `requireAdmin()`
 * in `app/admin/layout.tsx` and in every admin route handler performs the real
 * check against Supabase / the signed cookie. Proxy only saves an unauthorized
 * visitor from rendering the dashboard shell.
 *
 * Public routes (/, /shop, /product, /cart, /checkout, /track-order, /api/*)
 * are never intercepted — see the `matcher` below.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsSession = !isPublicAdminPath(pathname);

  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    /* -------- local development mode -------- */
    const hasLocalSession = Boolean(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    );

    if (needsSession && !hasLocalSession) {
      return NextResponse.redirect(loginUrl(request));
    }
    if (!needsSession && hasLocalSession) {
      return NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url));
    }
    return response;
  }

  /* -------- Supabase mode -------- */
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers ?? {})) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Refreshes the access token when needed and writes it back to the response.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (needsSession && !user) {
    return NextResponse.redirect(loginUrl(request));
  }
  if (!needsSession && user) {
    return NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url));
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function loginUrl(request: NextRequest): URL {
  const url = new URL(ADMIN_LOGIN_PATH, request.url);
  if (request.nextUrl.pathname !== ADMIN_LOGIN_PATH) {
    url.searchParams.set("next", request.nextUrl.pathname);
  }
  return url;
}

export const config = {
  // Only the admin area is gated; public pages and API routes are untouched.
  matcher: ["/admin", "/admin/:path*"],
};
