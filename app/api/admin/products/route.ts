import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/admin";
import { revalidateStorefront } from "@/lib/cache/revalidate";
import { getProducts } from "@/lib/products/getProducts";
import { createProduct, ProductWriteError } from "@/lib/products/saveProduct";
import {
  parseProductPayload,
  asString,
} from "@/lib/validation";

/**
 * GET  /api/admin/products — full catalogue (drafts + archived included)
 * POST /api/admin/products — create a product
 *
 * Both require an authorized admin session.
 */
export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.status === 403 ? "Forbidden." : "Authentication required." },
      { status: auth.status },
    );
  }

  const search = asString(new URL(request.url).searchParams.get("q")) || undefined;
  const products = await getProducts({ includeInactive: true, search, limit: 200 });

  return NextResponse.json({ products, count: products.length });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.status === 403 ? "Forbidden." : "Authentication required." },
      { status: auth.status },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = parseProductPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const product = await createProduct(parsed.value);
    revalidateStorefront();
    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    if (error instanceof ProductWriteError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[api/admin/products] create failed:", error);
    return NextResponse.json(
      { error: "Could not create the product." },
      { status: 500 },
    );
  }
}
