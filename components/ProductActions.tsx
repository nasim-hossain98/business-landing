"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, CreditCard, Check } from "lucide-react";
import { useCart } from "@/components/providers/CartContext";
import ProductOptions, { getDefaultOption } from "@/components/ProductOptions";
import type { Product } from "@/data/products";

export default function ProductActions({
  product,
  disabled = false,
}: {
  product: Product;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [option, setOption] = useState(getDefaultOption(product.options));

  const handleAddToCart = () => {
    addItem(product, option);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem(product, option);
    router.push("/checkout");
  };

  return (
    <>
      <ProductOptions option={option} setOption={setOption} options={product.options} />
      <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-8 border-t border-stone-200 dark:border-stone-800">
        <button
          onClick={handleAddToCart}
          disabled={disabled}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-stone-900 dark:border-white px-8 py-4 text-sm font-semibold text-stone-900 dark:text-white transition-all duration-300 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 tracking-wider uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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
          disabled={disabled}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full btn-slide px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 active:scale-100 tracking-wider uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <CreditCard size={18} />
          Buy Now
        </button>
      </div>
    </>
  );
}
