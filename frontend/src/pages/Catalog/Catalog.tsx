import React, { useState, useMemo, useCallback } from "react";
import {
  Breadcrumbs,
  PageHeader,
  SearchInput,
  UserIcon,
} from "@/components/index.ts";
import { useAsyncData } from "@/hooks/index.ts";
import { fetchPatterns } from "@/api/patterns.ts";
import type { CatalogPatternItem } from "./catalogData.ts";
import {
  getCategoryName,
  getCategorySubtitle,
  findDollById,
  filterPatterns,
  buildCatalogBreadcrumbs,
  getCatalogHeaderTexts,
} from "./catalogUtils.ts";
import { PatternCard, PatternModal } from "./components/index.ts";
import "./catalog.css";

export interface CatalogProps {
  patterns?: CatalogPatternItem[];
  isLoading?: boolean;
  initialCategory?: string;
  initialDollId?: number | null;
  onBackToMain?: () => void;
  onAddToCart?: (title: string) => void;
  onToggleWishlist?: (patternId: number) => void;
  wishlistIds?: number[];
  cartItems?: { id?: number; title: string }[];
  onNavigateToChooseDoll?: () => void;
}

export const Catalog: React.FC<CatalogProps> = ({
  patterns: propPatterns,
  isLoading: propIsLoading,
  initialCategory = "all",
  initialDollId = null,
  onBackToMain,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  cartItems = [],
  onNavigateToChooseDoll,
}) => {
  // Универсальная загрузка выкроек из базы данных PostgreSQL
  const { data: fetchedPatterns = [], isLoading: internalLoading } =
    useAsyncData(fetchPatterns, {
      initialData: [],
      enabled: !propPatterns || propPatterns.length === 0,
    });

  const patterns =
    propPatterns && propPatterns.length > 0 ? propPatterns : fetchedPatterns;
  const isLoading = propIsLoading ?? internalLoading;

  // Состояние фильтрации
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory || "all",
  );
  const [activeDollId, setActiveDollId] = useState<number | null>(initialDollId);
  const [searchQuery, setSearchQuery] = useState("");

  // Модальное окно быстрого просмотра
  const [selectedPattern, setSelectedPattern] =
    useState<CatalogPatternItem | null>(null);

  const handleOpenPattern = useCallback((item: CatalogPatternItem) => {
    setSelectedPattern(item);
  }, []);

  const wishlistSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);
  const cartTitlesSet = useMemo(
    () => new Set(cartItems.map((c) => c.title)),
    [cartItems],
  );

  // Вспомогательные вычисления (вынесены в catalogUtils)
  const currentCategoryName = useMemo(
    () => getCategoryName(patterns, activeCategory),
    [patterns, activeCategory],
  );

  const categorySubtitle = useMemo(
    () => getCategorySubtitle(patterns, activeCategory),
    [patterns, activeCategory],
  );

  const selectedDoll = useMemo(
    () => findDollById(patterns, activeDollId),
    [patterns, activeDollId],
  );

  const filteredPatterns = useMemo(
    () =>
      filterPatterns(patterns, {
        activeCategory,
        activeDollId,
        searchQuery,
      }),
    [patterns, activeCategory, activeDollId, searchQuery],
  );

  const handleResetToCatalog = useCallback(() => {
    setActiveCategory("all");
    setActiveDollId(null);
    window.location.hash = "catalog";
  }, []);

  const handleResetDoll = useCallback(() => {
    setActiveDollId(null);
    window.location.hash = activeCategory;
  }, [activeCategory]);

  const handleResetFilters = useCallback(() => {
    setActiveCategory("all");
    setActiveDollId(null);
    setSearchQuery("");
    window.location.hash = "catalog";
  }, []);

  const breadcrumbsData = useMemo(
    () =>
      buildCatalogBreadcrumbs({
        activeCategory,
        selectedDoll,
        categoryName: currentCategoryName,
        onBackToMain,
        onResetToCatalog: handleResetToCatalog,
        onResetDoll: handleResetDoll,
      }),
    [
      activeCategory,
      selectedDoll,
      currentCategoryName,
      onBackToMain,
      handleResetToCatalog,
      handleResetDoll,
    ],
  );

  const headerTexts = useMemo(
    () =>
      getCatalogHeaderTexts(
        activeCategory,
        selectedDoll,
        currentCategoryName,
        categorySubtitle,
      ),
    [activeCategory, selectedDoll, currentCategoryName, categorySubtitle],
  );

  return (
    <div className="page-container catalog-page">
      {/* Верхняя строка: хлебные крошки слева, компактный поиск справа */}
      <div className="page-top-bar">
        <Breadcrumbs
          items={breadcrumbsData.trail}
          current={breadcrumbsData.current}
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
        title={headerTexts.title}
        subtitle={headerTexts.subtitle}
      />

      {/* Бейдж выбранной куклы с быстрой кнопкой сброса */}
      {selectedDoll && (
        <div className="catalog-doll-badge">
          <span>
            Показаны выкройки для: <strong>{selectedDoll.nameRu}</strong> (
            {filteredPatterns.length})
          </span>
          <button
            type="button"
            className="catalog-doll-badge__clear"
            onClick={handleResetDoll}
          >
            ✕ Показать все выкройки категории
          </button>
        </div>
      )}

      {/* Сетка выкроек или статус загрузки */}
      {isLoading && patterns.length === 0 ? (
        <div className="catalog-empty">
          <p className="catalog-empty__desc">
            Загрузка выкроек из базы данных...
          </p>
        </div>
      ) : filteredPatterns.length === 0 ? (
        <div className="catalog-empty">
          <h3 className="catalog-empty__title">Выкройки не найдены</h3>
          <p className="catalog-empty__desc">
            По заданным фильтрам и поисковому запросу «{searchQuery}» пока
            ничего нет.
          </p>
          <button
            type="button"
            className="catalog-empty__btn"
            onClick={handleResetFilters}
          >
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

      {/* Баннер анатомического справочника кукол */}
      <div className="catalog-guide-banner">
        <div className="catalog-guide-banner__info">
          <h3 className="catalog-guide-banner__title">
            Не уверены, подойдёт ли выкройка вашей кукле?
          </h3>
          <p className="catalog-guide-banner__desc">
            Используйте наш «Анатомический справочник GOOSE». В нём собраны 27
            типов тел (Барби, Кен, MiniFee, Блайз) с точными мерками обхвата
            груди, талии и бёдер.
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

      {/* Модальное окно быстрого просмотра выкройки */}
      <PatternModal
        pattern={selectedPattern}
        onClose={() => setSelectedPattern(null)}
      />
    </div>
  );
};

export default Catalog;
