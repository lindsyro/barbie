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
} from "./pages/index.ts";
import "./App.css";

const KNOWN_PAGES: Record<string, string> = {
  main: "main",
  catalog: "catalog",
  barbie: "catalog",
  barbie2: "catalog",
  ken: "catalog",
  children: "catalog",
  tutorials: "tutorials",
  courses: "courses",
  free: "free",
  useful: "useful",
  about: "about",
};

function App() {
  const [currentPage, setCurrentPage] = useState<string>("main");
  const [cartCount, setCartCount] = useState(2);
  const [wishlistCount] = useState(3);
  const [notification, setNotification] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);

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
        onCartClick={() => showNotification(`Корзина: у вас ${cartCount} товара(ов)`)}
        onWishlistClick={() => showNotification(`Избранное: у вас ${wishlistCount} позиции(й)`)}
        onSearchSubmit={(q) => showNotification(`Поиск выкройки: "${q}"`)}
        onAuthClick={() => setAuthModal("login")}
      />

      {/* Всплывающее уведомление */}
      {notification && <div className="app-toast">{notification}</div>}

      {/* Основной контент страниц */}
      <main className="app-main">{renderCurrentPage()}</main>

      {/* Модальные окна авторизации */}
      <LoginModal
        isOpen={authModal === "login"}
        onClose={() => setAuthModal(null)}
        onSwitchToRegister={() => setAuthModal("register")}
        onForgotPassword={() =>
          showNotification("Ссылка для сброса пароля отправлена на почту")
        }
        onLoginSuccess={(email) =>
          showNotification(`Добро пожаловать в личный кабинет, ${email}!`)
        }
      />

      <RegisterModal
        isOpen={authModal === "register"}
        onClose={() => setAuthModal(null)}
        onSwitchToLogin={() => setAuthModal("login")}
        onRegisterSuccess={(email) =>
          showNotification(`Регистрация успешна! Добро пожаловать, ${email}!`)
        }
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
