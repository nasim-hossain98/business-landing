"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, CreditCard, Check } from "lucide-react";
import { useCart } from "@/components/providers/CartContext";
import type { Product } from "@/data/products";

export default function ProductActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem(product);
    router.push("/cart");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-8 border-t border-stone-200 dark:border-stone-800">
      <button
        onClick={handleAddToCart}
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-stone-900 dark:border-white px-8 py-4 text-sm font-semibold text-stone-900 dark:text-white transition-all duration-300 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 tracking-wider uppercase"
      >
        {added ? (
          <>
            <Check size={18} />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart size={18} />
            Add to Cart
          </>
        )}
      </button>
      <button
        onClick={handleBuyNow}
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full btn-slide px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 active:scale-100 tracking-wider uppercase"
      >
        <CreditCard size={18} />
        Buy Now
      </button>
    </div>
  );
}
