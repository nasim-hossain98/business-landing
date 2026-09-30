import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/admin";
import { listOrders } from "@/lib/orders/listOrders";
import { asInt, asString, parseOrderStatus, parsePaymentStatus } from "@/lib/validation";

/**
 * GET /api/admin/orders — list orders with the same filters the panel uses.
 *
 * Admin-only. Unlike the public tracking endpoint this response includes the
 * internal order `id` (needed to PATCH a status) because the caller is an
 * authenticated admin session.
 */
export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.status === 403 ? "Forbidden." : "Authentication required." },
      { status: auth.status },
    );
  }

  const params = new URL(request.url).searchParams;
  const limit = asInt(params.get("limit") ?? undefined) ?? 50;

  const { orders, total } = await listOrders({
    search: asString(params.get("q")) || undefined,
    status: parseOrderStatus(params.get("status")) ?? undefined,
    paymentStatus: parsePaymentStatus(params.get("paymentStatus")) ?? undefined,
    limit: Math.min(Math.max(limit, 1), 200),
    offset: Math.max(asInt(params.get("offset")) ?? 0, 0),
    orderBy: params.get("orderBy") === "oldest" ? "oldest" : "newest",
  });

  return NextResponse.json({
    total,
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    })),
  });
}
