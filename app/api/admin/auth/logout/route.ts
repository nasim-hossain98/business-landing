import { NextResponse } from "next/server";

import { signOutAdmin } from "@/lib/auth/admin";

/** POST /api/admin/auth/logout — clears the Supabase session and local cookie. */
export async function POST() {
  await signOutAdmin();
  return NextResponse.json({ ok: true });
}
