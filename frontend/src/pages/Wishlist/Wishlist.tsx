import React, { useMemo } from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import type { WishlistProps } from "./types.ts";
import { PatternCard } from "../../components/PatternCard";
import "./wishlist.css";
import "../pages.css";

export const Wishlist: React.FC<WishlistProps> = ({
  items,
  isLoading = false,
  isLoggedIn = false,
  onRemoveFromWishlist,
  onAddToCart,
  onBackToMain,
  onOpenLogin,
  cartItems = [],
}) => {
  const cartTitlesSet = useMemo(
    () => new Set(cartItems.map((c) => c.title)),
    [cartItems],
  );
  return (
    <div className="page-container">
      {/* Хлебные крошки */}
      <Breadcrumbs current="Избранное" onBackToMain={onBackToMain} />

      {/* Заголовок страницы */}
      <PageHeader title="Избранные выкройки" />

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
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="wishlist-empty__title">В избранном пока ничего нет</h2>
          <p className="wishlist-empty__desc">
            Сохраняйте понравившиеся выкройки, нажимая на иконку сердечка на
            карточках товаров.
            {!isLoggedIn &&
              " Войдите в аккаунт, чтобы просмотреть выкройки, сохраненные ранее."}
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
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
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>
                  Вы просматриваете избранное на этом устройстве.{" "}
                  <strong>Войдите в аккаунт</strong>, чтобы сохранить выкройки
                  навсегда и синхронизировать их на всех устройствах.
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

          <div className="wishlist-grid">
            {items.map((item) => (
              <PatternCard
                key={item.id}
                pattern={item}
                isLiked={true}
                isInCart={cartTitlesSet.has(item.title)}
                onToggleWishlist={onRemoveFromWishlist}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
