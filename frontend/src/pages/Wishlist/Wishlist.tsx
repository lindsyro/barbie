import React, { useMemo, useState, useCallback } from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import { SearchInput } from "../../components/SearchInput";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder.tsx";
import { WishlistGuestBanner } from "../../components/WishlistGuestBanner/WishlistGuestBanner.tsx";
import { HeartIcon } from "@/components/icons/index.ts";
import type { WishlistProps } from "./types.ts";
import { searchPatterns } from "../../utils/patternSearch.ts";
import { PatternCard } from "../../components/PatternCard";
import "./wishlist.css";
import "../pages.css";

export const Wishlist: React.FC<WishlistProps> = React.memo(({
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

  const handleResetSearch = useCallback((e?: React.MouseEvent<HTMLAnchorElement>) => {
    e?.preventDefault();
    setSearchQuery("");
  }, []);

  const handleBackToMainClick = useCallback((e?: React.MouseEvent<HTMLAnchorElement>) => {
    e?.preventDefault();
    onBackToMain?.();
  }, [onBackToMain]);

  const filteredItems = useMemo(
    () => searchPatterns(items, searchQuery),
    [items, searchQuery],
  );

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
          onButtonClick={handleBackToMainClick}
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
          onButtonClick={handleResetSearch}
        />
      ) : (
        /* Список карточек избранного */
        <div className="wishlist-container">
          {/* Мягкий баннер для гостей */}
          {!isLoggedIn && <WishlistGuestBanner onOpenLogin={onOpenLogin} />}

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
});

export default Wishlist;
