import React, { useState, useMemo, useEffect } from "react";
import { Breadcrumbs, PageHeader, SearchInput, UserIcon, CartIcon } from "@/components/index.ts";
import {
  CATALOG_CATEGORIES,
  CATALOG_PATTERNS,
  type CatalogPatternItem,
  type CatalogCategoryMeta,
} from "./catalogData.ts";
import { PatternCard } from "./components/index.ts";
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

export const Catalog: React.FC<CatalogProps> = ({
  initialCategory = "all",
  initialSubcategory = "all",
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

  // Выбранная подкатегория
  const [activeSubcategory, setActiveSubcategory] = useState<string>(initialSubcategory);

  // Поисковая строка и сортировка
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "price_asc" | "price_desc">("popular");

  // Модальное окно быстрого просмотра
  const [selectedPattern, setSelectedPattern] = useState<CatalogPatternItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const handleOpenPattern = (item: CatalogPatternItem) => {
    setSelectedPattern(item);
    setActiveImageIndex(0);
  };

  // Управление галереей в модальном окне с клавиатуры (Esc, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!selectedPattern) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPattern(null);
      } else if (e.key === "ArrowLeft") {
        if (selectedPattern.images && selectedPattern.images.length > 1) {
          setActiveImageIndex((prev) =>
            prev > 0 ? prev - 1 : selectedPattern.images.length - 1
          );
        }
      } else if (e.key === "ArrowRight") {
        if (selectedPattern.images && selectedPattern.images.length > 1) {
          setActiveImageIndex((prev) =>
            prev < selectedPattern.images.length - 1 ? prev + 1 : 0
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPattern]);

  const wishlistSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);
  const cartTitlesSet = useMemo(() => new Set(cartItems.map((c) => c.title)), [cartItems]);

  // Метаданные текущей активной категории
  const currentCategoryMeta: CatalogCategoryMeta = useMemo(() => {
    return (
      CATALOG_CATEGORIES.find((c) => c.id === activeCategory) ||
      CATALOG_CATEGORIES[0]
    );
  }, [activeCategory]);

  // Фильтрация и сортировка выкроек
  const filteredPatterns = useMemo(() => {
    let result = CATALOG_PATTERNS.filter((item) => {
      // 1. Фильтр по категории
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }
      // 2. Фильтр по подкатегории
      if (activeSubcategory !== "all" && item.subcategory !== activeSubcategory) {
        return false;
      }
      // 3. Поиск
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDoll = item.doll.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inTag = item.tag.toLowerCase().includes(q);
        return inTitle || inDoll || inDesc || inTag;
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
  }, [activeCategory, activeSubcategory, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setActiveCategory("all");
    setActiveSubcategory("all");
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
      {selectedPattern && (
        <div className="doll-modal-overlay" onClick={() => setSelectedPattern(null)}>
          <div className="catalog-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="doll-modal__close-btn"
              onClick={() => setSelectedPattern(null)}
              aria-label="Закрыть"
            >
              ×
            </button>

            {/* Колонка галереи фотографий */}
            <div className="catalog-modal__gallery-col">
              <div className="catalog-modal__img-box">
                <img
                  src={
                    selectedPattern.images && selectedPattern.images.length > 0
                      ? selectedPattern.images[activeImageIndex] || selectedPattern.image
                      : selectedPattern.image
                  }
                  alt={`${selectedPattern.title} - фото ${activeImageIndex + 1}`}
                  className="catalog-modal__img"
                />

                {/* Навигация стрелками и счетчик */}
                {selectedPattern.images && selectedPattern.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="catalog-modal__nav-btn catalog-modal__nav-btn--prev"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) =>
                          prev > 0 ? prev - 1 : selectedPattern.images.length - 1
                        );
                      }}
                      aria-label="Предыдущее фото"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="catalog-modal__nav-btn catalog-modal__nav-btn--next"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) =>
                          prev < selectedPattern.images.length - 1 ? prev + 1 : 0
                        );
                      }}
                      aria-label="Следующее фото"
                    >
                      ›
                    </button>
                    <span className="catalog-modal__counter">
                      {activeImageIndex + 1} / {selectedPattern.images.length}
                    </span>
                  </>
                )}
              </div>

              {/* Лента миниатюр */}
              {selectedPattern.images && selectedPattern.images.length > 1 && (
                <div className="catalog-modal__thumbs">
                  {selectedPattern.images.map((imgSrc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`catalog-modal__thumb ${idx === activeImageIndex ? "catalog-modal__thumb--active" : ""}`}
                      onClick={() => setActiveImageIndex(idx)}
                      title={`Фото ${idx + 1}`}
                      aria-label={`Переключить на фото ${idx + 1}`}
                    >
                      <img src={imgSrc} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="catalog-modal__body">
              <span className="catalog-modal__badge">
                Масштаб {selectedPattern.scale} • {selectedPattern.tag}
              </span>
              <h2 className="catalog-modal__title">{selectedPattern.title}</h2>
              <p className="catalog-modal__doll">
                Рекомендовано для кукол: <strong>{selectedPattern.doll}</strong>
              </p>

              <p className="catalog-modal__desc">{selectedPattern.description}</p>

              {selectedPattern.fabricRecommended && (
                <div className="catalog-modal__fabrics">
                  <strong>Рекомендуемые материалы:</strong> {selectedPattern.fabricRecommended}
                </div>
              )}

              <div className="catalog-modal__footer">
                <span className="catalog-modal__price">{selectedPattern.priceFormatted}</span>

                <button
                  type="button"
                  className="catalog-modal__btn-add"
                  onClick={() => {
                    onAddToCart?.(selectedPattern.title);
                    setSelectedPattern(null);
                  }}
                >
                  <CartIcon size={16} />
                  <span>Добавить в корзину</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
