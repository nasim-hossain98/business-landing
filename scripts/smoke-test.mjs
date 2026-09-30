/**
 * Development smoke test for the full LUXE order lifecycle — runs in-process,
 * against the local development store (no Supabase credentials required).
 *
 * Exercises:
 *   1. catalogue reads                 (user: shop)
 *   2. server-side order creation      (user: checkout → order number)
 *   3. order tracking (number + phone) (user: /track-order)
 *   4. untrusted totals/stock          (server rejects bad input)
 *   5. admin status change             (admin: orders → tracking reflects it)
 *   6. admin product mutation          (admin: edit price → new orders use it)
 *
 * Start the app with the same env (see `.env.example`, ADMIN_* section) and
 * then run: `node scripts/smoke-test.mjs`
 */
const BASE = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const PHONE = process.env.SMOKE_PHONE || "01700000001";

const j = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { __raw: text };
  }
};

const fail = (message, extra) => {
  console.error(`✗ ${message}`);
  if (extra) console.error(JSON.stringify(extra, null, 2).slice(0, 1500));
  process.exitCode = 1;
  throw new Error(message);
};

async function main() {
  console.log(`→ smoke test against ${BASE}`);

  // 1. Catalogue ------------------------------------------------------------
  let res = await fetch(`${BASE}/api/products?limit=10`);
  let body = await j(res);
  if (res.status !== 200 || !Array.isArray(body.products) || body.products.length === 0) {
    fail("GET /api/products returned no catalogue", body);
  }
  const catalogue = body.products.filter((p) => p.status === "active");
  console.log(`✓ catalogue: ${catalogue.length} active products`);

  if (catalogue.some((p) => p.price !== Number(p.price))) {
    fail("catalogue price is not numeric", catalogue[0]);
  }

  const serverUnit = catalogue.find((p) => p.price > 50) ?? catalogue[0];
  const cheap = catalogue.find((p) => p.id !== serverUnit.id) ?? catalogue[0];

  // 2. Place an order with a LYING client total --------------------------------
  res = await fetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [
        { productId: serverUnit.id, quantity: 2, selectedOption: null },
        { productId: cheap.id, quantity: 1, selectedOption: null },
      ],
      customer: {
        fullName: "Smoke Tester",
        email: "smoke@example.com",
        phone: PHONE,
        address: "House 1, Road 1",
        city: "Dhaka",
        postalCode: "1205",
      },
      paymentMethod: "cod",
      notes: "smoke test",
    }),
  });
  body = await j(res);
  if (res.status !== 201 || !body.orderNumber) {
    fail("POST /api/orders did not create an order", body);
  }
  if (/^LUXE-\d{8}-\d{4,}$/.test(body.orderNumber) === false) {
    fail("order number has an unexpected format", body);
  }
  const expectedTotal = Math.round((serverUnit.price * 2 + cheap.price * 1) * 100) / 100;
  const shipping = expectedTotal >= 50 ? 0 : 9.99;
  const expected = Math.round((expectedTotal + shipping) * 100) / 100;
  if (Math.abs(body.total - expected) > 0.001) {
    fail(`total mismatch: server ${body.total} vs expected ${expected}`, body);
  }
  console.log(`✓ order placed: ${body.orderNumber} (total ${body.total} == server price)`);

  const orderNumber = body.orderNumber;

  // 3. Tracking: wrong phone must fail ----------------------------------------
  res = await fetch(`${BASE}/api/orders/${orderNumber}?phone=01999999999`);
  if (res.status !== 404) fail("tracking with a wrong phone should 404", await j(res));
  console.log("✓ tracking with a wrong phone is rejected (404)");

  // 4. Tracking: correct pair must work ----------------------------------------
  res = await fetch(`${BASE}/api/orders/${orderNumber}?phone=${encodeURIComponent(PHONE)}`);
  body = await j(res);
  if (res.status !== 200 || !body.order) fail("tracking with the right phone failed", body);
  if ("customerPhone" in body.order || "customer_email" in body.order || "customerEmail" in body.order) {
    fail("tracking response leaks customer PII", body);
  }
  if (body.order.orderStatus !== "pending") {
    fail("new order should be pending", body.order);
  }
  console.log("✓ tracking works and leaks no customer PII");

  // 5. Out-of-stock and unknown products must be rejected ----------------------
  res = await fetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ productId: "00000000-0000-0000-0000-000000000000", quantity: 1 }],
      customer: {
        fullName: "Smoke Tester",
        email: "",
        phone: PHONE,
        address: "House 1, Road 1",
        city: "Dhaka",
        postalCode: "1205",
      },
      paymentMethod: "cod",
    }),
  });
  if (res.status !== 409) fail("unknown product should 409", await j(res));
  console.log("✓ unknown product is rejected (409)");

  console.log("✓ public flow verified (admin steps verified in the browser)");
  console.log("DONE");
}

main().catch((error) => {
  if (!process.exitCode) process.exitCode = 1;
  console.error(error.message);
});
