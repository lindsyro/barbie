import React, { useState, useMemo } from "react";
import { Breadcrumbs, PageHeader, SearchInput, UserIcon } from "@/components/index.ts";
import { CATALOG_PATTERNS, type CatalogPatternItem } from "./catalogData.ts";
import { PatternCard, PatternModal } from "./components/index.ts";
import "./catalog.css";

export interface CatalogProps {
  initialCategory?: string;
  initialSubcategory?: string;
  onBackToMain?: () => void;
  onAddToCart?: (title: string) => void;
  onToggleWishlist?: (patternId: number) => void;
  wishlistIds?: number[];
  cartItems?: { id?: number; title: string }[];
  onNavigateToChooseDoll?: () => void;
}

type MainCategoryId = "all" | "girls-1-6" | "girls-1-4" | "guys" | "kids";

const CATEGORY_INFO: Record<MainCategoryId, { title: string; subtitle: string; breadcrumb: string }> = {
  all: {
    title: "Каталог выкроек",
    subtitle: "Авторские PDF-лекала GOOSE Fashion House",
    breadcrumb: "Все выкройки",
  },
  "girls-1-6": {
    title: "Выкройки для девушек 1/6",
    subtitle: "Барби Standard, Curvy, Tall, Mizi, Momoko, Poppy Parker, Блайз",
    breadcrumb: "Для девушек 1/6",
  },
  "girls-1-4": {
    title: "Выкройки для девушек 1/4",
    subtitle: "Коллекции для шарнирных кукол BJD и MiniFee",
    breadcrumb: "Для девушек 1/4",
  },
  guys: {
    title: "Выкройки для парней",
    subtitle: "Мужская кукольная мода: Кен, Adonis 2.0, FR Homme",
    breadcrumb: "Для парней",
  },
  kids: {
    title: "Выкройки для миниатюрных кукол",
    subtitle: "Келли, Chelsea (Челси), Lati Yellow, Obitsu 11",
    breadcrumb: "Для детей и миниатюр",
  },
};

export const Catalog: React.FC<CatalogProps> = ({
  initialCategory = "all",
  initialSubcategory: _initialSubcategory = "all",
  onBackToMain,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  cartItems = [],
  onNavigateToChooseDoll,
}) => {
  // Выбранная категория
  const [activeCategory, setActiveCategory] = useState<MainCategoryId>(() => {
    const validIds: MainCategoryId[] = ["all", "girls-1-6", "girls-1-4", "guys", "kids"];
    return validIds.includes(initialCategory as MainCategoryId)
      ? (initialCategory as MainCategoryId)
      : "all";
  });

  // Поисковая строка и сортировка
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "price_asc" | "price_desc">("popular");

  // Модальное окно быстрого просмотра
  const [selectedPattern, setSelectedPattern] = useState<CatalogPatternItem | null>(null);

  const handleOpenPattern = (item: CatalogPatternItem) => {
    setSelectedPattern(item);
  };

  const wishlistSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);
  const cartTitlesSet = useMemo(() => new Set(cartItems.map((c) => c.title)), [cartItems]);

  const currentCategoryMeta = CATEGORY_INFO[activeCategory] || CATEGORY_INFO.all;

  // Фильтрация и сортировка выкроек
  const filteredPatterns = useMemo(() => {
    let result = CATALOG_PATTERNS.filter((item) => {
      // 1. Фильтр по категории
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }
      // 2. Поиск
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDoll = item.doll.toLowerCase().includes(q);
        return inTitle || inDoll;
      }
      return true;
    });

    // Сортировка
    if (sortBy === "price_asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [activeCategory, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
    setSortBy("popular");
    window.location.hash = "catalog";
  };

  return (
    <div className="page-container catalog-page">
      {/* Верхняя строка: хлебные крошки слева, компактный поиск справа */}
      <div className="page-top-bar">
        <Breadcrumbs
          current={activeCategory === "all" ? "Каталог выкроек" : currentCategoryMeta.breadcrumb}
          onBackToMain={onBackToMain}
        />
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск выкройки..."
        />
      </div>

      {/* Динамический заголовок страницы */}
      <PageHeader
        title={currentCategoryMeta.title}
        subtitle={currentCategoryMeta.subtitle}
      />

      {/* 2. Сетка выкроек */}
      {filteredPatterns.length === 0 ? (
        <div className="catalog-empty">
          <h3 className="catalog-empty__title">Выкройки не найдены</h3>
          <p className="catalog-empty__desc">
            По заданным фильтрам и поисковому запросу «{searchQuery}» пока ничего нет.
          </p>
          <button type="button" className="catalog-empty__btn" onClick={handleResetFilters}>
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="catalog-grid">
          {filteredPatterns.map((item) => (
            <PatternCard
              key={item.id}
              pattern={item}
              isLiked={wishlistSet.has(item.id)}
              isInCart={cartTitlesSet.has(item.title)}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={onAddToCart}
              onOpenPattern={handleOpenPattern}
            />
          ))}
        </div>
      )}

      {/* 3. Баннер анатомического справочника кукол */}
      <div className="catalog-guide-banner">
        <div className="catalog-guide-banner__info">
          <h3 className="catalog-guide-banner__title">Не уверены, подойдёт ли выкройка вашей кукле?</h3>
          <p className="catalog-guide-banner__desc">
            Используйте наш «Анатомический справочник GOOSE». В нём собраны 27 типов тел (Барби, Кен, MiniFee, Блайз) с точными мерками обхвата груди, талии и бёдер.
          </p>
        </div>
        <button
          type="button"
          className="catalog-guide-banner__btn"
          onClick={() => {
            if (onNavigateToChooseDoll) {
              onNavigateToChooseDoll();
            } else {
              window.location.hash = "choose-doll";
            }
          }}
        >
          <UserIcon size={16} />
          <span>Выбрать куклу по меркам</span>
        </button>
      </div>

      {/* 4. Модальное окно быстрого просмотра выкройки */}
      <PatternModal
        pattern={selectedPattern}
        onClose={() => setSelectedPattern(null)}
      />
    </div>
  );
};

export default Catalog;
