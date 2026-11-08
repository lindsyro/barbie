import { useState } from "react";
import Header from "./components/Header/Header.tsx";
import Footer from "./components/Footer/Footer.tsx";
import Main from "./pages/Main/Main.tsx";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState<string>("main");
  const [cartCount, setCartCount] = useState(2);
  const [wishlistCount] = useState(3);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddToCart = (title: string) => {
    setCartCount((prev) => prev + 1);
    showNotification(`Выкройка «${title}» добавлена в корзину`);
  };

  const handleSelectCategory = (categoryId: string) => {
    showNotification(`Фильтр по категории: ${categoryId}`);
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
        onAuthClick={() => showNotification("Вход / Регистрация")}
      />

      {/* Всплывающее уведомление */}
      {notification && <div className="app-toast">{notification}</div>}

      {/* Основной контент страниц */}
      <main className="app-main">
        {currentPage === "main" && (
          <Main
            onAddToCart={handleAddToCart}
            onSelectCategory={handleSelectCategory}
          />
        )}
        {currentPage !== "main" && (
          <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <h2>Страница находится в разработке</h2>
            <button
              type="button"
              onClick={() => setCurrentPage("main")}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1.25rem",
                background: "var(--color-gold-site)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Вернуться на главную
            </button>
          </div>
        )}
      </main>

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
