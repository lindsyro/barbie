import React from "react";
import {
  Breadcrumbs,
  PageHeader,
  SearchInput,
} from "@/components/index.ts";
import type { CatalogPatternItem } from "./types.ts";
import { useCatalog } from "./useCatalog.ts";
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

      {/* Динамический заголовок страницы */}
      <PageHeader title={catalogTitle} />

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
