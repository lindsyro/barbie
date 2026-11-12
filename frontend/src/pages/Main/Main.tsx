import React from "react";
import type { MainProps } from "./types.ts";
import { FEATURED_PATTERNS, CATEGORIES_QUICK } from "./mainData.tsx";
import "./main.css";

const BASE = import.meta.env.BASE_URL;

export const Main: React.FC<MainProps> = ({
  onAddToCart,
  onSelectCategory,
  onToggleWishlist,
  wishlistIds = [],
}) => {
  const wishlistSet = new Set(wishlistIds);
  return (
    <div className="page-main">
      {/* 1. Главный баннер */}
      <section className="main-hero" aria-label="Главный баннер GOOSE Fashion House">
        <div className="main-hero__container">
          <img
            src={`${BASE}banner.png`}
            alt="GOOSE Fashion House — PDF-выкройки для одежды кукол"
            className="main-hero__img"
          />
        </div>
      </section>

      {/* 2. Полоса преимуществ */}
      {/* <section className="main-advantages" aria-label="Преимущества выкроек GOOSE">
        <div className="main-container">
          <div className="main-advantages__grid">
            {ADVANTAGES.map((adv) => (
              <div key={adv.id} className="main-advantages__card">
                <div className="main-advantages__icon">{adv.icon}</div>
                <div className="main-advantages__info">
                  <h3 className="main-advantages__title">{adv.title}</h3>
                  <p className="main-advantages__desc">{adv.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* 3. Каталог популярных выкроек */}
      <section className="main-catalog" id="catalog" aria-label="Популярные PDF-выкройки">
        <div className="main-container">
          {/* Заголовок секции */}
          <div className="main-section-header">
            <span className="main-section-header__subtitle">Каталог коллекций</span>
            <h2 className="main-section-header__title">Популярные PDF-выкройки</h2>
            <div className="main-section-header__line" />
          </div>

          {/* Быстрые категории/фильтры */}
          <div className="main-categories-nav">
            {CATEGORIES_QUICK.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="main-categories-nav__btn"
                onClick={() => onSelectCategory?.(cat.id)}
              >
                <span>{cat.name}</span>
                <span className="main-categories-nav__count">{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Сетка карточек выкроек */}
          <div className="main-patterns-grid">
            {FEATURED_PATTERNS.map((item) => {
              const isLiked = wishlistSet.has(item.id);
              return (
                <article key={item.id} className="main-pattern-card">
                  <div className="main-pattern-card__img-box">
                    <img src={item.image} alt={item.title} className="main-pattern-card__img" />
                    <span className="main-pattern-card__tag">{item.tag}</span>
                    <button
                      type="button"
                      className={`main-pattern-card__wishlist-btn ${isLiked ? "main-pattern-card__wishlist-btn--active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist?.(item.id);
                      }}
                      aria-label={isLiked ? `Удалить ${item.title} из избранного` : `Добавить ${item.title} в избранное`}
                      title={isLiked ? "В избранном" : "Добавить в избранное"}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                <div className="main-pattern-card__body">
                  <span className="main-pattern-card__doll">{item.doll}</span>
                  <h3 className="main-pattern-card__title">{item.title}</h3>
                  <div className="main-pattern-card__footer">
                    <span className="main-pattern-card__price">{item.price}</span>
                    <button
                      type="button"
                      className="main-pattern-card__btn"
                      onClick={() => onAddToCart?.(item.title)}
                      aria-label={`Добавить в корзину: ${item.title}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" fill="currentColor" />
                        <circle cx="20" cy="21" r="1" fill="currentColor" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                      <span>В корзину</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Main;
