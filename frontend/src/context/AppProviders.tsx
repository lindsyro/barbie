import React from "react";
import { NotificationProvider } from "./NotificationProvider.tsx";
import { AuthProvider } from "./AuthProvider.tsx";
import { CartProvider } from "./CartProvider.tsx";
import { WishlistProvider } from "./WishlistProvider.tsx";
import { RouterProvider } from "@/router/index.ts";

export interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Единый компонент-компоновщик провайдеров приложения.
 * Инкапсулирует строгий порядок зависимостей контекстов:
 * Notification -> Auth -> Cart & Wishlist -> Router
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <RouterProvider>{children}</RouterProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};
