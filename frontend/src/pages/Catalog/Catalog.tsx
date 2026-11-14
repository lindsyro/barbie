import React, { useState, useMemo, useEffect } from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.tsx";
import {
  CATALOG_CATEGORIES,
  CATALOG_PATTERNS,
  type CatalogPatternItem,
  type CatalogCategoryMeta,
} from "./catalogData.ts";
import "./catalog.css";
import "../pages.css";

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

  // Подсчёт количества товаров в каждой категории
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: CATALOG_PATTERNS.length,
      "girls-1-6": CATALOG_PATTERNS.filter((p) => p.category === "girls-1-6").length,
      "girls-1-4": CATALOG_PATTERNS.filter((p) => p.category === "girls-1-4").length,
      guys: CATALOG_PATTERNS.filter((p) => p.category === "guys").length,
      kids: CATALOG_PATTERNS.filter((p) => p.category === "kids").length,
    };
    return counts;
  }, []);

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

  const handleCategoryClick = (catId: MainCategoryId) => {
    setActiveCategory(catId);
    setActiveSubcategory("all");
    window.location.hash = catId === "all" ? "catalog" : catId;
  };

  const handleResetFilters = () => {
    setActiveCategory("all");
    setActiveSubcategory("all");
    setSearchQuery("");
    setSortBy("popular");
    window.location.hash = "catalog";
  };

  return (
    <div className="page-container catalog-page">
      {/* Хлебные крошки */}
      <Breadcrumbs
        current={activeCategory === "all" ? "Каталог выкроек" : currentCategoryMeta.breadcrumb}
        onBackToMain={onBackToMain}
      />

      {/* Динамический заголовок страницы */}
      <PageHeader
        title={currentCategoryMeta.title}
        subtitle={currentCategoryMeta.subtitle}
      />

      {/* 1. Панель фильтров и управления каталогом */}
      <div className="catalog-toolbar">
        {/* Табы основных категорий с подсчётом */}
        <div className="catalog-tabs">
          {CATALOG_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`catalog-tab ${activeCategory === cat.id ? "catalog-tab--active" : ""}`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <span>{cat.label}</span>
              <span className="catalog-tab__count">{categoryCounts[cat.id] || 0}</span>
            </button>
          ))}
        </div>

        {/* Чипсы быстрых подкатегорий (Барби Стандарт, Curvy, Tall, 90-е и т.д.) */}
        {currentCategoryMeta.subcategories.length > 0 && (
          <div className="catalog-subcategories">
            {currentCategoryMeta.subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                className={`catalog-chip ${activeSubcategory === sub.id ? "catalog-chip--active" : ""}`}
                onClick={() => setActiveSubcategory(sub.id)}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* Панель поиска и сортировки */}
        <div className="catalog-controls">
          <div className="catalog-search">
            <svg
              className="catalog-search__icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="catalog-search__input"
              placeholder="Поиск по названию платья, кукле или ткани (например, боди, Кен, MiniFee, бархат)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="catalog-sort">
            <span className="catalog-sort__label">Сортировка:</span>
            <select
              className="catalog-sort__select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "popular" | "price_asc" | "price_desc")}
            >
              <option value="popular">По популярности</option>
              <option value="price_asc">Сначала дешевле</option>
              <option value="price_desc">Сначала дороже</option>
            </select>
          </div>
        </div>
      </div>

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
          {filteredPatterns.map((item) => {
            const isLiked = wishlistSet.has(item.id);
            const isInCart = cartTitlesSet.has(item.title);

            return (
              <article key={item.id} className="catalog-card">
                {/* Фотография выкройки */}
                <div
                  className="catalog-card__img-box"
                  onClick={() => handleOpenPattern(item)}
                  title="Нажмите для подробного описания и всех ракурсов"
                >
                  <img src={item.image} alt={item.title} className="catalog-card__img" loading="lazy" />
                  <span className="catalog-card__tag">{item.tag}</span>
                  <span className="catalog-card__scale">{item.scale}</span>

                  {/* Бейдж количества фото (если их больше 1) */}
                  {item.images && item.images.length > 1 && (
                    <span className="catalog-card__photos-count" title={`Всего ${item.images.length} фото`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span>{item.images.length} фото</span>
                    </span>
                  )}

                  {/* Кнопка добавления в избранное */}
                  <button
                    type="button"
                    className={`catalog-card__wishlist-btn ${isLiked ? "catalog-card__wishlist-btn--active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist?.(item.id);
                    }}
                    title={isLiked ? "В избранном" : "Добавить в избранное"}
                    aria-label={isLiked ? "Удалить из избранного" : "Добавить в избранное"}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={isLiked ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* Информация о товаре */}
                <div className="catalog-card__body">
                  <span className="catalog-card__doll-fit">{item.doll}</span>
                  <h3
                    className="catalog-card__title"
                    onClick={() => handleOpenPattern(item)}
                    title={item.title}
                  >
                    {item.title}
                  </h3>

                  <div className="catalog-card__meta">
                    <span className="catalog-card__difficulty">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {item.difficulty}
                    </span>
                    <span>•</span>
                    <span>{item.format}</span>
                  </div>

                  {/* Нижняя плашка: цена и корзина */}
                  <div className="catalog-card__footer">
                    <span className="catalog-card__price">{item.priceFormatted}</span>

                    <button
                      type="button"
                      className={`catalog-card__btn-cart ${isInCart ? "catalog-card__btn-cart--added" : ""}`}
                      onClick={() => onAddToCart?.(item.title)}
                    >
                      {isInCart ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>В корзине</span>
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                          </svg>
                          <span>В корзину</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
          </svg>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
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
