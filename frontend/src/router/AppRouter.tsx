import React, { useCallback } from "react";
import { useAsyncData } from "@/hooks/index.ts";
import { fetchPatterns } from "@/api/patterns.ts";
import {
  Main,
  Catalog,
  Tutorials,
  Courses,
  Free,
  Useful,
  About,
  Account,
  ChooseDoll,
  Measurements,
  ShoppingTerms,
  Reviews,
  Cart,
  Wishlist,
} from "@/pages/index.ts";
import { useRouter } from "./RouterContext.ts";
import { useCart, useWishlist, useAuth, useNotification } from "@/context/index.ts";

export const AppRouter: React.FC = () => {
  const { currentPage, catalogCategory, catalogDollId, navigateTo } = useRouter();
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { currentUser, openLogin, logout } = useAuth();
  const { showNotification } = useNotification();

  // Загрузка всех выкроек из базы данных
  const { data: patterns = [], isLoading: isPatternsLoading } = useAsyncData(
    fetchPatterns,
    { initialData: [] },
  );

  const handleBackToMain = useCallback(() => {
    navigateTo("main");
  }, [navigateTo]);

  const handleCheckout = useCallback(() => {
    if (!currentUser) {
      openLogin("cart");
      showNotification("Для оформления заказа необходимо войти в аккаунт");
      return;
    }
    const orderNum = `ORD-${Date.now().toString().slice(-6)}`;
    clearCart();
    showNotification(
      `Заказ #${orderNum} успешно оформлен! Ссылки на PDF отправлены на email.`,
    );
    navigateTo("account");
  }, [currentUser, openLogin, showNotification, clearCart, navigateTo]);

  const handleSelectCategory = useCallback(
    (categoryId: string) => {
      navigateTo(categoryId === "all" ? "catalog" : categoryId);
    },
    [navigateTo],
  );

  switch (currentPage) {
    case "catalog":
      return (
        <Catalog
          patterns={patterns}
          isLoading={isPatternsLoading}
          initialCategory={catalogCategory}
          initialDollId={catalogDollId}
          onBackToMain={handleBackToMain}
          onAddToCart={addToCart}
          onToggleWishlist={toggleWishlist}
          wishlistIds={wishlistIds}
          cartItems={cart}
        />
      );
    case "tutorials":
      return <Tutorials onBackToMain={handleBackToMain} />;
    case "courses":
      return <Courses onBackToMain={handleBackToMain} />;
    case "free":
      return <Free onBackToMain={handleBackToMain} />;
    case "useful":
      return <Useful onBackToMain={handleBackToMain} />;
    case "about":
      return <About onBackToMain={handleBackToMain} />;
    case "account":
      return (
        <Account
          user={currentUser}
          onBackToMain={handleBackToMain}
          onLogout={logout}
          onOpenLogin={() => openLogin()}
          onNavigateToCatalog={() => navigateTo("catalog")}
        />
      );
    case "choose-doll":
      return (
        <ChooseDoll
          onBackToMain={handleBackToMain}
          onNavigateToCatalog={(hash) => navigateTo(hash || "catalog")}
        />
      );
    case "measurements":
      return <Measurements onBackToMain={handleBackToMain} />;
    case "shopping-terms":
      return <ShoppingTerms onBackToMain={handleBackToMain} />;
    case "reviews":
      return <Reviews onBackToMain={handleBackToMain} />;
    case "cart":
      return (
        <Cart
          items={cart}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onCheckout={handleCheckout}
          onContinueShopping={() => navigateTo("catalog")}
          onBackToMain={handleBackToMain}
          isLoggedIn={Boolean(currentUser)}
        />
      );
    case "wishlist":
      return <Wishlist />;
    case "main":
    default:
      return (
        <Main
          patterns={patterns}
          onAddToCart={(title: string) => addToCart(title)}
          onSelectCategory={handleSelectCategory}
          onToggleWishlist={toggleWishlist}
          wishlistIds={wishlistIds}
          cartItems={cart}
        />
      );
  }
};
