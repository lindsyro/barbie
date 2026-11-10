import { useState, useEffect } from "react";
import Header from "./components/Header/Header.tsx";
import Footer from "./components/Footer/Footer.tsx";
import { LoginModal, RegisterModal } from "./components/index.ts";
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
  Girls16,
  Girls14,
  Guys,
  Kids,
} from "./pages/index.ts";
import "./App.css";

const KNOWN_PAGES: Record<string, string> = {
  main: "main",
  catalog: "catalog",
  "all-patterns": "catalog",
  // 1/6
  "girls-1-6": "girls-1-6",
  barbie: "girls-1-6",
  "barbie-standard": "girls-1-6",
  "barbie-curvy": "girls-1-6",
  "barbie-petite": "girls-1-6",
  "barbie-tall": "girls-1-6",
  "barbie-90s": "girls-1-6",
  "poppy-parker": "girls-1-6",
  blythe: "girls-1-6",
  // 1/4
  "girls-1-4": "girls-1-4",
  barbie2: "girls-1-4",
  "girls-1": "girls-1-4",
  "girls-2": "girls-1-4",
  "girls-3": "girls-1-4",
  // Guys
  guys: "guys",
  ken: "guys",
  "ken-standard": "guys",
  "ken-broad": "guys",
  "adonis-2-0": "guys",
  "it-homme": "guys",
  "minifee-boy": "guys",
  "guys-outerwear": "guys",
  // Kids
  kids: "kids",
  children: "kids",
  chelsea: "kids",
  "lati-yellow": "kids",
  "middie-obitsu": "kids",
  // Other pages
  tutorials: "tutorials",
  courses: "courses",
  free: "free",
  useful: "useful",
  about: "about",
  account: "account",
  profile: "account",
  "choose-doll": "choose-doll",
  dolls: "choose-doll",
  measurements: "measurements",
  "a4-print": "measurements",
  "shopping-terms": "shopping-terms",
  faq: "shopping-terms",
  reviews: "reviews",
};

function App() {
  const [currentPage, setCurrentPage] = useState<string>("main");
  const [cartCount, setCartCount] = useState(2);
  const [wishlistCount] = useState(3);
  const [notification, setNotification] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [currentUser, setCurrentUser] = useState<{ email: string; name?: string } | null>(() => {
    try {
      const saved = localStorage.getItem("goose_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [pendingAction, setPendingAction] = useState<"cart" | "wishlist" | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace("#", "").trim();
      if (!rawHash) {
        setCurrentPage("main");
        return;
      }
      const pageKey = KNOWN_PAGES[rawHash] || (rawHash.startsWith("barbie") || rawHash.startsWith("ken") || rawHash.startsWith("girls") ? "catalog" : rawHash);
      setCurrentPage(pageKey);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateTo = (page: string) => {
    window.location.hash = page;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddToCart = (title: string) => {
    setCartCount((prev) => prev + 1);
    showNotification(`Выкройка «${title}» добавлена в корзину`);
  };

  const handleSelectCategory = (categoryId: string) => {
    showNotification(`Выбрана категория: ${categoryId}`);
    navigateTo("catalog");
  };

  const handleCartClick = () => {
    if (!currentUser) {
      setPendingAction("cart");
      showNotification("Пожалуйста, войдите в аккаунт для перехода в корзину");
      setAuthModal("login");
      return;
    }
    showNotification(`Корзина: у вас ${cartCount} товара(ов)`);
  };

  const handleWishlistClick = () => {
    if (!currentUser) {
      setPendingAction("wishlist");
      showNotification("Пожалуйста, войдите в аккаунт для просмотра избранного");
      setAuthModal("login");
      return;
    }
    showNotification(`Избранное: у вас ${wishlistCount} позиции(й)`);
  };

  const handleAuthClick = () => {
    if (currentUser) {
      navigateTo("account");
    } else {
      setAuthModal("login");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("goose_user");
    } catch {
      // ignore
    }
    showNotification("Вы успешно вышли из аккаунта");
    navigateTo("main");
  };

  const handleLoginSuccess = (email: string) => {
    const user = { email, name: email.split("@")[0] };
    setCurrentUser(user);
    try {
      localStorage.setItem("goose_user", JSON.stringify(user));
    } catch {
      // ignore
    }

    if (pendingAction === "cart") {
      showNotification(`Добро пожаловать, ${user.name}! Корзина: у вас ${cartCount} товара(ов)`);
      setPendingAction(null);
    } else if (pendingAction === "wishlist") {
      showNotification(`Добро пожаловать, ${user.name}! Избранное: у вас ${wishlistCount} позиции(й)`);
      setPendingAction(null);
    } else {
      showNotification(`Добро пожаловать в личный кабинет, ${user.name}!`);
      navigateTo("account");
    }
  };

  const handleRegisterSuccess = (email: string) => {
    const user = { email, name: email.split("@")[0] };
    setCurrentUser(user);
    try {
      localStorage.setItem("goose_user", JSON.stringify(user));
    } catch {
      // ignore
    }

    if (pendingAction === "cart") {
      showNotification(`Регистрация успешна! Корзина: у вас ${cartCount} товара(ов)`);
      setPendingAction(null);
    } else if (pendingAction === "wishlist") {
      showNotification(`Регистрация успешна! Избранное: у вас ${wishlistCount} позиции(й)`);
      setPendingAction(null);
    } else {
      showNotification(`Регистрация успешна! Добро пожаловать, ${user.name}!`);
      navigateTo("account");
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "catalog":
        return <Catalog onBackToMain={() => navigateTo("main")} />;
      case "tutorials":
        return <Tutorials onBackToMain={() => navigateTo("main")} />;
      case "courses":
        return <Courses onBackToMain={() => navigateTo("main")} />;
      case "free":
        return <Free onBackToMain={() => navigateTo("main")} />;
      case "useful":
        return <Useful onBackToMain={() => navigateTo("main")} />;
      case "about":
        return <About onBackToMain={() => navigateTo("main")} />;
      case "account":
        return (
          <Account
            user={currentUser}
            onBackToMain={() => navigateTo("main")}
            onLogout={handleLogout}
            onOpenLogin={() => setAuthModal("login")}
          />
        );
      case "choose-doll":
        return <ChooseDoll onBackToMain={() => navigateTo("main")} />;
      case "measurements":
        return <Measurements onBackToMain={() => navigateTo("main")} />;
      case "shopping-terms":
        return <ShoppingTerms onBackToMain={() => navigateTo("main")} />;
      case "reviews":
        return <Reviews onBackToMain={() => navigateTo("main")} />;
      case "girls-1-6":
        return <Girls16 onBackToMain={() => navigateTo("main")} />;
      case "girls-1-4":
        return <Girls14 onBackToMain={() => navigateTo("main")} />;
      case "guys":
        return <Guys onBackToMain={() => navigateTo("main")} />;
      case "kids":
        return <Kids onBackToMain={() => navigateTo("main")} />;
      case "main":
      default:
        return (
          <Main
            onAddToCart={handleAddToCart}
            onSelectCategory={handleSelectCategory}
          />
        );
    }
  };

  return (
    <div className="app-layout">
      {/* Шапка сайта */}
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        activeHref={`#${currentPage}`}
        isLoggedIn={Boolean(currentUser)}
        userName={currentUser?.name || currentUser?.email}
        onCartClick={handleCartClick}
        onWishlistClick={handleWishlistClick}
        onSearchSubmit={(q) => showNotification(`Поиск выкройки: "${q}"`)}
        onAuthClick={handleAuthClick}
      />

      {/* Всплывающее уведомление */}
      {notification && <div className="app-toast">{notification}</div>}

      {/* Основной контент страниц */}
      <main className="app-main">{renderCurrentPage()}</main>

      {/* Модальные окна авторизации */}
      <LoginModal
        isOpen={authModal === "login"}
        onClose={() => {
          setAuthModal(null);
          setPendingAction(null);
        }}
        onSwitchToRegister={() => setAuthModal("register")}
        onForgotPassword={() =>
          showNotification("Ссылка для сброса пароля отправлена на почту")
        }
        onLoginSuccess={handleLoginSuccess}
      />

      <RegisterModal
        isOpen={authModal === "register"}
        onClose={() => {
          setAuthModal(null);
          setPendingAction(null);
        }}
        onSwitchToLogin={() => setAuthModal("login")}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* Подвал сайта */}
      <Footer
        onSubscribe={(email) =>
          showNotification(`Подписка оформлена для ${email}! Скидка активирована.`)
        }
      />
    </div>
  );
}

export default App;
