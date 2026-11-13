import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import type { WishlistProps } from "./types.ts";
import "./wishlist.css";
import "../pages.css";

export const Wishlist: React.FC<WishlistProps> = ({
  items,
  isLoading = false,
  isLoggedIn = false,
  onRemoveFromWishlist,
  onAddToCart,
  onAddAllToCart,
  onBackToMain,
  onOpenLogin,
}) => {
  return (
    <div className="page-container">
      {/* Хлебные крошки */}
      <Breadcrumbs current="Избранное" onBackToMain={onBackToMain} />

      {/* Заголовок страницы */}
      <PageHeader
        title="Избранные выкройки"
        subtitle="Ваша персональная подборка"
      />

      {/* Содержимое страницы */}
      {isLoading ? (
        <div className="wishlist-empty">
          <h2 className="wishlist-empty__title">Загрузка избранного...</h2>
          <p className="wishlist-empty__desc">Загружаем сохраненные выкройки</p>
        </div>
      ) : items.length === 0 ? (
        /* Пустой список избранного */
        <div className="wishlist-empty">
          <div className="wishlist-empty__icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="wishlist-empty__title">В избранном пока ничего нет</h2>
          <p className="wishlist-empty__desc">
            Сохраняйте понравившиеся выкройки, нажимая на иконку сердечка на карточках товаров.
            {!isLoggedIn && " Войдите в аккаунт, чтобы просмотреть выкройки, сохраненные ранее."}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="#catalog"
              onClick={(e) => {
                e.preventDefault();
                onBackToMain?.();
              }}
              className="wishlist-empty__btn"
            >
              ← Перейти к популярным выкройкам
            </a>
            {!isLoggedIn && onOpenLogin && (
              <button
                type="button"
                onClick={onOpenLogin}
                className="wishlist-empty__btn"
                style={{ backgroundColor: "var(--color-gold-site)" }}
              >
                Войти в аккаунт
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Список карточек избранного */
        <div className="wishlist-container">
          {/* Мягкий баннер для гостей */}
          {!isLoggedIn && (
            <div className="wishlist-guest-banner">
              <div className="wishlist-guest-banner__content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>
                  Вы просматриваете избранное на этом устройстве. <strong>Войдите в аккаунт</strong>, чтобы сохранить выкройки навсегда и синхронизировать их на всех устройствах.
                </span>
              </div>
              {onOpenLogin && (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="wishlist-guest-banner__btn"
                >
                  Войти и сохранить
                </button>
              )}
            </div>
          )}

          <div className="wishlist-toolbar">
            <div className="wishlist-toolbar__info">
              <span>Сохранено выкроек:</span>
              <span className="wishlist-toolbar__count">{items.length}</span>
            </div>

            {onAddAllToCart && items.length > 0 && (
              <div className="wishlist-toolbar__actions">
                <button
                  type="button"
                  onClick={onAddAllToCart}
                  className="wishlist-toolbar__btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" fill="currentColor" />
                    <circle cx="20" cy="21" r="1" fill="currentColor" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <span>Добавить все в корзину</span>
                </button>
              </div>
            )}
          </div>

          <div className="wishlist-grid">
            {items.map((item) => (
              <article key={item.id} className="wishlist-card">
                <div className="wishlist-card__img-box">
                  <img src={item.image} alt={item.title} className="wishlist-card__img" />
                  {item.tag && <span className="wishlist-card__tag">{item.tag}</span>}
                  <button
                    type="button"
                    className="wishlist-card__remove-btn"
                    onClick={() => onRemoveFromWishlist(item.id)}
                    aria-label={`Удалить ${item.title} из избранного`}
                    title="Удалить из избранного"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="wishlist-card__body">
                  <span className="wishlist-card__doll">{item.doll}</span>
                  <h3 className="wishlist-card__title">{item.title}</h3>
                  <span className="wishlist-card__format">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {item.format || "PDF на А4 • Мгновенно"}
                  </span>

                  <div className="wishlist-card__footer">
                    <span className="wishlist-card__price">{item.price} ₽</span>
                    <button
                      type="button"
                      className="wishlist-card__cart-btn"
                      onClick={() => onAddToCart(item.title)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" fill="currentColor" />
                        <circle cx="20" cy="21" r="1" fill="currentColor" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                      <span>В корзину</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
