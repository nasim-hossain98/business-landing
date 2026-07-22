"use client";

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { Product } from "@/data/products";

export type CartItemType = {
  product: Product;
  quantity: number;
};

export type CustomerInfo = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
};

export type PaymentMethod = "bkash" | "nagad" | "cod";

type CartState = {
  items: CartItemType[];
  customer: CustomerInfo;
  paymentMethod: PaymentMethod;
};

type CartAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; productId: number }
  | { type: "INCREMENT"; productId: number }
  | { type: "DECREMENT"; productId: number }
  | { type: "CLEAR_CART" }
  | { type: "SET_CUSTOMER"; customer: CustomerInfo }
  | { type: "SET_PAYMENT"; method: PaymentMethod }
  | { type: "HYDRATE"; state: Partial<CartState> };

const defaultCustomer: CustomerInfo = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  notes: "",
};

const CartContext = createContext<{
  state: CartState;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  increment: (productId: number) => void;
  decrement: (productId: number) => void;
  clearCart: () => void;
  setCustomer: (customer: CustomerInfo) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  totalItems: number;
  totalPrice: number;
} | null>(null);

const STORAGE_KEY = "luxe-cart";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.product.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      return { ...state, items: [...state.items, { product: action.product, quantity: 1 }] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) };
    case "INCREMENT":
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        ),
      };
    case "DECREMENT":
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.product.id === action.productId
              ? { ...i, quantity: i.quantity - 1 }
              : i,
          )
          .filter((i) => i.quantity > 0),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "SET_CUSTOMER":
      return { ...state, customer: action.customer };
    case "SET_PAYMENT":
      return { ...state, paymentMethod: action.method };
    case "HYDRATE":
      return { ...state, ...action.state };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    customer: defaultCustomer,
    paymentMethod: "cod" as PaymentMethod,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<CartState>;
        dispatch({ type: "HYDRATE", state: parsed });
      }
    } catch {
      // ignore malformed data
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addItem = (product: Product) => dispatch({ type: "ADD_ITEM", product });
  const removeItem = (productId: number) => dispatch({ type: "REMOVE_ITEM", productId });
  const increment = (productId: number) => dispatch({ type: "INCREMENT", productId });
  const decrement = (productId: number) => dispatch({ type: "DECREMENT", productId });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });
  const setCustomer = (customer: CustomerInfo) => dispatch({ type: "SET_CUSTOMER", customer });
  const setPaymentMethod = (method: PaymentMethod) => dispatch({ type: "SET_PAYMENT", method });

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        state, addItem, removeItem, increment, decrement, clearCart,
        setCustomer, setPaymentMethod, totalItems, totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
