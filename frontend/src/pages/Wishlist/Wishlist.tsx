import React, { useMemo, useState } from "react";
import {
  Breadcrumbs,
  PageHeader,
  SearchInput,
  PagePlaceholder,
  WishlistGuestBanner,
  PatternCard,
  PatternModal,
  HeartIcon,
} from "@/components/index.ts";
import type { CatalogPatternItem } from "@/api/patterns.ts";
import { searchPatterns } from "@/utils/patternSearch.ts";
import { useWishlist, useCart, useAuth } from "@/context/index.ts";
import { useRouter } from "@/router/index.ts";
import "./wishlist.css";

export const Wishlist: React.FC = React.memo(() => {
  const {
    wishlist: items,
    isWishlistLoading: isLoading,
    removeFromWishlist,
  } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { isLoggedIn, openLogin } = useAuth();
  const { navigateTo } = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPattern, setSelectedPattern] =
    useState<CatalogPatternItem | null>(null);

  const handleResetSearch = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    e?.preventDefault();
    setSearchQuery("");
  };

  const handleBackToMain = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    e?.preventDefault();
    navigateTo("main");
  };

  const handleOpenLogin = () => {
    openLogin("wishlist");
  };

  const filteredItems = useMemo(
    () => searchPatterns(items, searchQuery),
    [items, searchQuery],
  );

  return (
    <div className="page-container wishlist-page">
      {/* Верхняя строка: хлебные крошки слева, компактный поиск справа */}
      <div className="page-top-bar">
        <Breadcrumbs current="Избранное" onBackToMain={handleBackToMain} />
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
          onButtonClick={handleBackToMain}
        >
          {!isLoggedIn && (
            <button
              type="button"
              onClick={handleOpenLogin}
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
          {!isLoggedIn && <WishlistGuestBanner onOpenLogin={handleOpenLogin} />}

          <div className="wishlist-grid">
            {filteredItems.map((item) => (
              <PatternCard
                key={item.id}
                pattern={item}
                isLiked={true}
                isInCart={isInCart(item.title)}
                onToggleWishlist={removeFromWishlist}
                onAddToCart={addToCart}
                onOpenPattern={setSelectedPattern}
              />
            ))}
          </div>
        </div>
      )}

      {/* Модальное окно просмотра выкройки */}
      <PatternModal
        pattern={selectedPattern}
        onClose={() => setSelectedPattern(null)}
      />
    </div>
  );
});

Wishlist.displayName = "Wishlist";

export default Wishlist;
