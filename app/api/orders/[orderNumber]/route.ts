import { NextResponse } from "next/server";

import { findOrderForTracking, toPublicOrder } from "@/lib/orders/getOrder";
import { asString } from "@/lib/validation";

/**
 * GET /api/orders/[orderNumber]?phone=01XXXXXXXXX
 *
 * Public order tracking. **Both** the order number and the phone number on the
 * order must match, so a leaked order number reveals nothing on its own.
 * The response is a whitelisted projection — no phone, email or address.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const phone = asString(new URL(request.url).searchParams.get("phone"));

  if (!orderNumber || !phone) {
    return NextResponse.json(
      { error: "Order number and phone number are both required." },
      { status: 400 },
    );
  }

  const order = await findOrderForTracking(orderNumber, phone);
  if (!order) {
    return NextResponse.json(
      { error: "We could not find an order matching that number and phone." },
      { status: 404 },
    );
  }

  return NextResponse.json({ order: toPublicOrder(order) });
}
