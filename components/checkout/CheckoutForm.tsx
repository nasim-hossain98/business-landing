"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Package, ShieldCheck } from "lucide-react";
import { useCart } from "@/components/providers/CartContext";
import CustomerInfoForm from "@/components/CustomerInfoForm";
import PaymentMethodSelect from "@/components/PaymentMethodSelect";
import CartSummary, { EmptyCartNotice } from "@/components/cart/CartSummary";
import { formatCurrency } from "@/lib/format";
import { calcTotals } from "@/lib/pricing";

/**
 * Checkout form (client).
 *
 * Sends product ids + quantities only. Prices, shipping, totals and the order
 * number are produced server-side by `POST /api/orders` →
 * `lib/orders/createOrder.ts`; the totals shown here are a preview that uses
 * the very same `calcTotals()` helper, so the numbers always agree.
 */
export default function CheckoutForm() {
  const { state, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = calcTotals(totalPrice);
  const customer = state.customer;
  const detailsComplete = Boolean(
    customer.fullName &&
      customer.phone &&
      customer.address &&
      customer.city &&
      customer.postalCode,
  );

  async function handlePlaceOrder(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!detailsComplete) {
      setError("Please complete your delivery information above.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: state.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            selectedOption: item.selectedOption || null,
          })),
          customer,
          paymentMethod: state.paymentMethod,
          notes: customer.notes || null,
        }),
      });

      const data = (await response.json()) as {
        orderNumber?: string;
        error?: string;
      };

      if (!response.ok || !data.orderNumber) {
        setError(data.error ?? "We could not place your order. Please try again.");
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/order-success/${encodeURIComponent(data.orderNumber)}`);
    } catch {
      setError("Network error — please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (state.items.length === 0) {
    return <EmptyCartNotice />;
  }

  return (
    <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12 items-start">
      <div className="lg:col-span-2 space-y-8">
        <CustomerInfoForm alwaysEditing />
        <PaymentMethodSelect />

        <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
          <ShieldCheck size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
          <p>
            Mobile wallet options record your intent — our team confirms payment
            with you before dispatch. Cash on Delivery is settled on arrival, so
            the order starts as <span className="font-medium">unpaid</span> and is
            marked <span className="font-medium">paid</span> once delivered.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm dark:border-red-500/30 dark:bg-red-500/10">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-red-500" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-32">
        <CartSummary
          showItems
          title="Order Summary"
          showPerks={false}
        >
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full btn-slide px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-100 tracking-wider uppercase disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Placing order…
              </>
            ) : (
              <>
                <Package size={18} />
                Place Order — {formatCurrency(totals.total)}
              </>
            )}
          </button>

          {!detailsComplete && (
            <p className="mt-3 text-center text-xs text-stone-400 dark:text-stone-500">
              Fill in your delivery details to enable placing the order.
            </p>
          )}
        </CartSummary>
      </div>
    </form>
  );
}
