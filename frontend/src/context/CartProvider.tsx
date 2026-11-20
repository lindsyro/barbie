import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { CartItemType } from "@/pages/Cart/types.ts";
import { findCachedPatternByTitle } from "@/api/patterns.ts";
import { getPatternImages } from "@/utils/patternImages.ts";
import {
  CartContext,
  type AddToCartPayload,
} from "./CartContext.ts";
import { useNotification } from "./NotificationContext.ts";

const CART_STORAGE_KEY = "goose_cart";

function getStoredCart(): CartItemType[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItemType[]) : [];
  } catch {
    return [];
  }
}

export interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItemType[]>(() => getStoredCart());
  const { showNotification } = useNotification();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error("Ошибка сохранения корзины в localStorage:", err);
    }
  }, [cart]);

  const cartTitlesSet = useMemo(
    () => new Set(cart.map((it) => it.title)),
    [cart],
  );

  const isInCart = useCallback(
    (title: string) => cartTitlesSet.has(title),
    [cartTitlesSet],
  );

  const addToCart = useCallback(
    (itemOrTitle: string | AddToCartPayload) => {
      const title =
        typeof itemOrTitle === "string" ? itemOrTitle : itemOrTitle.title;

      const alreadyInCart = cart.some((it) => it.title === title);
      if (alreadyInCart) {
        setCart((prev) => prev.filter((it) => it.title !== title));
        showNotification(`Выкройка «${title}» удалена из корзины`);
        return;
      }

      const explicitItem =
        typeof itemOrTitle === "object" ? itemOrTitle : undefined;
      const cached = findCachedPatternByTitle(title);

      const price = explicitItem?.price ?? cached?.price ?? 490;
      const numPrice =
        typeof price === "number"
          ? price
          : parseInt(String(price), 10) || 490;

      const id = explicitItem?.id ?? cached?.id ?? Date.now();
      const doll = explicitItem?.doll ?? cached?.doll ?? "Барби";
      const image =
        explicitItem?.image ||
        cached?.image ||
        (id ? getPatternImages(id)[0] : "") ||
        "";

      const newItem: CartItemType = {
        id,
        title,
        doll,
        price: numPrice,
        priceFormatted: `${numPrice} ₽`,
        image,
        tag: explicitItem?.tag || "Выкройка",
        format: explicitItem?.format || "PDF (А4 + инструкции)",
      };

      setCart((prev) => [...prev, newItem]);
      showNotification(`Выкройка «${title}» добавлена в корзину`);
    },
    [cart, showNotification],
  );

  const removeFromCart = useCallback(
    (id: number) => {
      setCart((prev) => prev.filter((it) => it.id !== id));
      showNotification("Выкройка удалена из корзины");
    },
    [showNotification],
  );

  const clearCart = useCallback(() => {
    setCart([]);
    showNotification("Корзина очищена");
  }, [showNotification]);

  const addAllToCart = useCallback(
    (items: AddToCartPayload[]) => {
      if (items.length === 0) return 0;
      let added = 0;
      setCart((prev) => {
        const existingTitles = new Set(prev.map((it) => it.title));
        const newItems: CartItemType[] = [];

        for (const item of items) {
          if (!existingTitles.has(item.title)) {
            const numPrice =
              typeof item.price === "number"
                ? item.price
                : parseInt(String(item.price || 490), 10) || 490;

            newItems.push({
              id: item.id || Date.now() + Math.random(),
              title: item.title,
              doll: item.doll || "Барби",
              price: numPrice,
              priceFormatted: `${numPrice} ₽`,
              image:
                item.image ||
                (item.id ? getPatternImages(item.id)[0] : "") ||
                "",
              tag: item.tag || "Выкройка",
              format: item.format || "PDF (А4 + инструкции)",
            });
            added++;
          }
        }
        return [...prev, ...newItems];
      });

      if (added > 0) {
        showNotification(`Добавлено в корзину: ${added} выкройки(ек)`);
      } else {
        showNotification("Все выкройки из избранного уже в вашей корзине");
      }
      return added;
    },
    [showNotification],
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart.length,
        cartTitlesSet,
        isInCart,
        addToCart,
        removeFromCart,
        clearCart,
        addAllToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
