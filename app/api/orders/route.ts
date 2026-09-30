import { NextResponse } from "next/server";

import { createOrder, OrderError } from "@/lib/orders/createOrder";
import { toPublicOrder } from "@/lib/orders/getOrder";
import { parseOrderPayload } from "@/lib/validation";

/**
 * POST /api/orders — public checkout.
 *
 * The request body carries product ids, quantities and the delivery details
 * only. Prices, shipping, totals, stock and the order number are all derived
 * on the server (see lib/orders/createOrder.ts).
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = parseOrderPayload(payload);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const order = await createOrder(parsed.value);
    return NextResponse.json(
      {
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        total: order.totalAmount,
        order: toPublicOrder(order),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/orders] unexpected failure:", error);
    return NextResponse.json(
      { error: "We could not place your order. Please try again." },
      { status: 500 },
    );
  }
}
