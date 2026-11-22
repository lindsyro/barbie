import React from "react";
import {
  Breadcrumbs,
  PageHeader,
  SearchInput,
  PatternCard,
  PatternModal,
} from "@/components/index.ts";
import type { CatalogPatternItem } from "./types.ts";
import { useCatalog } from "./useCatalog.ts";
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
}

export const Catalog: React.FC<CatalogProps> = (props) => {
  const {
    patterns,
    isLoading,
    searchQuery,
    setSearchQuery,
    filteredPatterns,
    wishlistSet,
    cartTitlesSet,
    selectedPattern,
    handleOpenPattern,
    handleClosePattern,
    catalogTitle,
    breadcrumbsData,
    handleResetFilters,
  } = useCatalog(props);

  return (
    <div className="page-container catalog-page">
      {/* Верхняя строка: хлебные крошки слева, компактный поиск справа */}
      <div className="page-top-bar">
        <Breadcrumbs
          items={breadcrumbsData.trail}
          current={breadcrumbsData.current}
          onBackToMain={props.onBackToMain}
        />
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск выкройки..."
        />
      </div>

      {/* Динамический заголовок страницы со счетчиком выкроек */}
      <PageHeader title={catalogTitle} />

      {/* Скелетоны при начальной загрузке выкроек из базы данных */}
      {isLoading && patterns.length === 0 ? (
        <div className="catalog-grid" aria-busy="true" aria-label="Загрузка каталога">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="catalog-skeleton-card">
              <div className="catalog-skeleton-card__img" />
              <div className="catalog-skeleton-card__body">
                <div className="catalog-skeleton-card__line catalog-skeleton-card__line--title" />
                <div className="catalog-skeleton-card__line catalog-skeleton-card__line--subtitle" />
                <div className="catalog-skeleton-card__footer">
                  <div className="catalog-skeleton-card__line catalog-skeleton-card__line--price" />
                  <div className="catalog-skeleton-card__line catalog-skeleton-card__line--btn" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPatterns.length === 0 ? (
        <div className="catalog-empty">
          <h3 className="catalog-empty__title">Выкройки не найдены</h3>
          {searchQuery ? (
            <p className="catalog-empty__desc">
              По запросу «{searchQuery}» ничего не найдено.
            </p>
          ) : (
            <p className="catalog-empty__desc">
              В выбранном разделе пока нет выкроек.
            </p>
          )}
          <button
            type="button"
            className="catalog-empty__reset-btn"
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
              onToggleWishlist={props.onToggleWishlist}
              onAddToCart={props.onAddToCart}
              onOpenPattern={handleOpenPattern}
            />
          ))}
        </div>
      )}

      {/* Модальное окно быстрого просмотра выкройки */}
      <PatternModal pattern={selectedPattern} onClose={handleClosePattern} />
    </div>
  );
};

export default Catalog;
