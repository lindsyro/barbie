import { useState } from "react";
import Header from "./components/Header/Header.tsx";
import Footer from "./components/Footer/Footer.tsx";
import "./App.css";

const FEATURED_ITEMS = [
  {
    id: 1,
    title: "Водолазка-боди для Барби",
    tag: "Хит продаж",
    doll: "Барби / Made to Move",
    price: "490 ₽",
    image: "/Водолазка-боди для Барби.png",
  },
  {
    id: 2,
    title: "Боди-бюстье «Афродита»",
    tag: "Новинка",
    doll: "Барби Standard & Curvy",
    price: "550 ₽",
    image: "/Выкройка боди-бюстье «Афродита» для Барби-2.png",
  },
  {
    id: 3,
    title: "Выкройка MiniFee: кофточка и брюки клёш",
    tag: "BJD",
    doll: "MiniFee (40-42 см)",
    price: "690 ₽",
    image: "/Выкройка MiniFee_ кофточка и брюки клёш-2.png",
  },
  {
    id: 4,
    title: "Элегантная водолазка-боди для Кена",
    tag: "Мужская коллекция",
    doll: "Ken Fashionistas / BMR1959",
    price: "490 ₽",
    image: "/Элегантная выкройка водолазки-боди для Кена.png",
  },
];

function App() {
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

  return (
    <div className="app-layout">
      {/* Шапка сайта */}
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onCartClick={() => showNotification("Корзина: у вас " + cartCount + " товара(ов)")}
        onWishlistClick={() => showNotification("Избранное: у вас " + wishlistCount + " позиции(й)")}
        onSearchSubmit={(q) => showNotification(`Поиск выкройки: "${q}"`)}
      />

      {/* Всплывающее уведомление */}
      {notification && <div className="app-toast">{notification}</div>}

      {/* Главный баннер */}
      <main className="app-main">
        <section className="hero-banner-section">
          <div className="hero-banner-container">
            <img
              src="/Снимок экрана — 2026-11-08 в 04.57.06.png"
              alt="GOOSE Fashion House — PDF-выкройки для одежды кукол"
              className="hero-banner-img"
            />
          </div>
        </section>

        {/* Каталог популярных выкроек */}
        <section className="catalog-preview-section" id="catalog">
          <div className="catalog-container">
            <div className="section-header">
              <span className="section-subtitle">Каталог коллекций</span>
              <h2 className="section-title">Популярные PDF-выкройки</h2>
              <div className="section-decor-line" />
            </div>

            <div className="pattern-cards-grid">
              {FEATURED_ITEMS.map((item) => (
                <article key={item.id} className="pattern-card">
                  <div className="pattern-card__image-box">
                    <img src={item.image} alt={item.title} className="pattern-card__img" />
                    <span className="pattern-card__tag">{item.tag}</span>
                  </div>
                  <div className="pattern-card__body">
                    <span className="pattern-card__doll">{item.doll}</span>
                    <h3 className="pattern-card__title">{item.title}</h3>
                    <div className="pattern-card__footer">
                      <span className="pattern-card__price">{item.price}</span>
                      <button
                        type="button"
                        className="pattern-card__btn"
                        onClick={() => handleAddToCart(item.title)}
                      >
                        В корзину
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
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
