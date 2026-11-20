import { createContext, useContext } from "react";
import type { CartItemType } from "@/pages/Cart/types.ts";

export interface AddToCartPayload {
  id?: number;
  title: string;
  doll?: string;
  price?: number;
  image?: string;
  tag?: string;
  format?: string;
}

export interface CartContextType {
  cart: CartItemType[];
  cartCount: number;
  cartTitlesSet: Set<string>;
  isInCart: (title: string) => boolean;
  addToCart: (itemOrTitle: string | AddToCartPayload) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  addAllToCart: (items: AddToCartPayload[]) => number;
}

export const CartContext = createContext<CartContextType | null>(null);

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
