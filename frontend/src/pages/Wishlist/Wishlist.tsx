import React, { useMemo, useState } from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import { SearchInput } from "../../components/SearchInput";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import { HeartIcon } from "@/components/icons/index.ts";
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchDoll =
        typeof item.doll === "string" && item.doll.toLowerCase().includes(q);
      const matchDolls =
        "dolls" in item && Array.isArray(item.dolls)
          ? item.dolls.some((d) =>
              (d.nameRu || d.nameEn || "").toLowerCase().includes(q),
            )
          : false;
      return matchTitle || matchDoll || matchDolls;
    });
  }, [items, searchQuery]);

  const cartTitlesSet = useMemo(
    () => new Set(cartItems.map((c) => c.title)),
    [cartItems],
  );
  return (
    <div className="page-container wishlist-page">
      {/* Верхняя строка: хлебные крошки слева, компактный поиск справа */}
      <div className="page-top-bar">
        <Breadcrumbs current="Избранное" onBackToMain={onBackToMain} />
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск по избранному..."
        />
      </div>

      {/* Заголовок страницы */}
      <PageHeader title="Избранные выкройки" />

      {/* Содержимое страницы */}
      {isLoading ? (
        <PagePlaceholder
          title="Загрузка избранного..."
          description="Загружаем сохраненные выкройки"
          buttonText=""
        />
      ) : items.length === 0 ? (
        /* Пустой список избранного */
        <PagePlaceholder
          icon={<HeartIcon size={36} />}
          title="В избранном пока ничего нет"
          description={`Сохраняйте понравившиеся выкройки, нажимая на иконку сердечка на карточках товаров.${
            !isLoggedIn
              ? " Войдите в аккаунт, чтобы просмотреть выкройки, сохраненные ранее."
              : ""
          }`}
          buttonText="← Перейти к популярным выкройкам"
          buttonHref="#catalog"
          onButtonClick={(e) => {
            e.preventDefault();
            onBackToMain?.();
          }}
        >
          {!isLoggedIn && onOpenLogin && (
            <button
              type="button"
              onClick={onOpenLogin}
              className="page-placeholder__btn"
              style={{ backgroundColor: "var(--color-chocolate)" }}
            >
              Войти в аккаунт
            </button>
          )}
        </PagePlaceholder>
      ) : filteredItems.length === 0 ? (
        /* Ничего не найдено по поисковому запросу */
        <PagePlaceholder
          title="Выкройки не найдены"
          description={`По запросу «${searchQuery}» ничего не найдено в избранном`}
          buttonText="Сбросить поиск"
          buttonHref="#clear-search"
          onButtonClick={(e) => {
            e.preventDefault();
            setSearchQuery("");
          }}
        />
      ) : (
        /* Список карточек избранного */
        <div className="wishlist-container">
          {/* Мягкий баннер для гостей */}
          {!isLoggedIn && (
            <div className="wishlist-guest-banner">
              <div className="wishlist-guest-banner__content">
                <svg
                  width="16"
                  height="16"
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
                  Войдите в аккаунт, чтобы сохранить избранное на всех устройствах
                </span>
              </div>
              {onOpenLogin && (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="wishlist-guest-banner__btn"
                >
                  Войти
                </button>
              )}
            </div>
          )}

          <div className="wishlist-grid">
            {filteredItems.map((item) => (
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
