import React from "react";
import {
  Header,
  Footer,
  LoginModal,
  RegisterModal,
} from "@/components/index.ts";
import {
  useAuth,
  useCart,
  useWishlist,
  useNotification,
} from "@/context/index.ts";
import { useRouter } from "@/router/index.ts";
import type { User } from "@/api/auth.ts";

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const {
    currentUser,
    isLoggedIn,
    authModal,
    pendingAction,
    openLogin,
    openRegister,
    closeAuthModal,
    logout,
    handleLoginSuccess,
    handleRegisterSuccess,
  } = useAuth();

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { notification, showNotification } = useNotification();
  const { currentPage, navigateTo } = useRouter();

  const handleLoginSuccessNav = (user: User) => {
    handleLoginSuccess(user);
    closeAuthModal();
    if (pendingAction === "cart") {
      showNotification(`Добро пожаловать, ${user.name}! Переходим в корзину.`);
      navigateTo("cart");
    } else if (pendingAction === "wishlist") {
      showNotification(`Добро пожаловать, ${user.name}! Переходим в избранное.`);
      navigateTo("wishlist");
    } else {
      showNotification(`Добро пожаловать в личный кабинет, ${user.name}!`);
      navigateTo("account");
    }
  };

  const handleRegisterSuccessNav = (user: User) => {
    handleRegisterSuccess(user);
    closeAuthModal();
    if (pendingAction === "cart") {
      showNotification("Регистрация успешна! Переходим в корзину.");
      navigateTo("cart");
    } else if (pendingAction === "wishlist") {
      showNotification("Регистрация успешна! Переходим в избранное.");
      navigateTo("wishlist");
    } else {
      showNotification(`Регистрация успешна! Добро пожаловать, ${user.name}!`);
      navigateTo("account");
    }
  };

  return (
    <div className="app-layout">
      {/* Шапка сайта */}
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        activeHref={`#${currentPage}`}
        isLoggedIn={isLoggedIn}
        userName={currentUser?.name || currentUser?.email}
        onCartClick={() => navigateTo("cart")}
        onWishlistClick={() => navigateTo("wishlist")}
        onSearchSubmit={(q) => showNotification(`Поиск выкройки: "${q}"`)}
        onAuthClick={() => {
          if (currentUser) {
            navigateTo("account");
          } else {
            openLogin();
          }
        }}
        onLogout={logout}
      />

      {/* Всплывающее уведомление */}
      {notification && <div className="app-toast">{notification}</div>}

      {/* Основной контент страниц */}
      <main className="app-main">{children}</main>

      {/* Модальные окна авторизации */}
      <LoginModal
        isOpen={authModal === "login"}
        onClose={closeAuthModal}
        onSwitchToRegister={() => openRegister()}
        onForgotPassword={() =>
          showNotification("Ссылка для сброса пароля отправлена на почту")
        }
        onLoginSuccess={handleLoginSuccessNav}
      />

      <RegisterModal
        isOpen={authModal === "register"}
        onClose={closeAuthModal}
        onSwitchToLogin={() => openLogin()}
        onRegisterSuccess={handleRegisterSuccessNav}
      />

      {/* Подвал сайта */}
      <Footer
        onSubscribe={(email) =>
          showNotification(
            `Подписка оформлена для ${email}! Скидка активирована.`,
          )
        }
      />
    </div>
  );
};
