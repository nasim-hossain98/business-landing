import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/admin";
import { revalidateStorefront } from "@/lib/cache/revalidate";
import { archiveProduct, deleteProduct } from "@/lib/products/deleteProduct";
import { updateProduct, ProductWriteError } from "@/lib/products/saveProduct";
import { parseProductPayload, asRecord } from "@/lib/validation";
import { slugify } from "@/lib/products/types";

async function guard() {
  const auth = await requireAdminApi();
  if (auth.authorized) return null;
  return NextResponse.json(
    { error: auth.status === 403 ? "Forbidden." : "Authentication required." },
    { status: auth.status },
  );
}

/** PATCH /api/admin/products/[id] — partial update (price, stock, status…). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const record = asRecord(body);
  const isFullPayload =
    record.name !== undefined || record.description !== undefined;

  // A full form submission goes through the same validation as creation.
  const parsed = isFullPayload
    ? parseProductPayload(record)
    : ({ ok: true, value: { ...record } } as const);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const patch = { ...(parsed.value as Record<string, unknown>) } as Record<
    string,
    unknown
  >;
  if (typeof patch.slug === "string") patch.slug = slugify(patch.slug);
  delete patch.id;
  delete patch.createdAt;
  delete patch.created_at;

  try {
    const product = await updateProduct(
      id,
      patch as Parameters<typeof updateProduct>[1],
    );
    revalidateStorefront();
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    if (error instanceof ProductWriteError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[api/admin/products] update failed:", error);
    return NextResponse.json(
      { error: "Could not update the product." },
      { status: 500 },
    );
  }
}

/** DELETE /api/admin/products/[id] — remove a product from the catalogue. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await params;
  const mode = new URL(request.url).searchParams.get("mode");

  try {
    if (mode === "archive") {
      await archiveProduct(id);
    } else {
      await deleteProduct(id);
    }
    revalidateStorefront();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/products] delete failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete." },
      { status: 500 },
    );
  }
}
