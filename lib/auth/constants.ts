/**
 * Auth constants shared by the Proxy (request-time redirect) and the
 * server-side authorization layer. Kept dependency-free so the Proxy bundle
 * stays small — see AGENTS.md / Next 16 `proxy.ts` conventions.
 */

export const ADMIN_SESSION_COOKIE = "luxe_admin_session";
export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_HOME_PATH = "/admin";

/** 8 hours — long enough for a working day, short enough to age out. */
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

/** Paths reachable without an admin session (only the sign-in screen). */
export function isPublicAdminPath(pathname: string): boolean {
  return pathname === ADMIN_LOGIN_PATH || pathname.startsWith(`${ADMIN_LOGIN_PATH}/`);
}
