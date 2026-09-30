import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/admin";
import { revalidateOrderViews } from "@/lib/cache/revalidate";
import { updateOrderStatus } from "@/lib/orders/updateOrderStatus";
import { asRecord, parseOrderStatus, parsePaymentStatus } from "@/lib/validation";

/**
 * PATCH /api/admin/orders/[id] — move an order through its lifecycle.
 *
 * Admin-only: the session is verified server-side by `requireAdminApi()`.
 * Never add a public route that can change `order_status` or `payment_status`.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.status === 403 ? "Forbidden." : "Authentication required." },
      { status: auth.status },
    );
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const record = asRecord(body);
  const orderStatus = parseOrderStatus(record.orderStatus ?? record.order_status);
  if (!orderStatus) {
    return NextResponse.json(
      { error: "A valid order status is required." },
      { status: 400 },
    );
  }

  const paymentStatus = parsePaymentStatus(
    record.paymentStatus ?? record.payment_status,
  );

  const updated = await updateOrderStatus(id, orderStatus, paymentStatus);
  if (!updated) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // The customer's tracking view must reflect the new status immediately.
  revalidateOrderViews(updated.orderNumber);

  return NextResponse.json({
    ok: true,
    orderNumber: updated.orderNumber,
    orderStatus: updated.orderStatus,
    paymentStatus: updated.paymentStatus,
    updatedAt: updated.updatedAt,
  });
}
