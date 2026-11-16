import React from "react";
import type { CatalogPatternItem } from "../catalogData.ts";

export interface PatternCardProps {
  pattern: CatalogPatternItem;
  isLiked?: boolean;
  isInCart?: boolean;
  onToggleWishlist?: (patternId: number) => void;
  onAddToCart?: (title: string) => void;
  onOpenPattern?: (pattern: CatalogPatternItem) => void;
}

export const PatternCard: React.FC<PatternCardProps> = React.memo(({
  pattern,
  isLiked = false,
  isInCart = false,
  onToggleWishlist,
  onAddToCart,
  onOpenPattern,
}) => {
  const handleOpen = () => {
    onOpenPattern?.(pattern);
  };

  return (
    <article className="catalog-card">
      {/* Фотография выкройки */}
      <div
        className="catalog-card__img-box"
        onClick={handleOpen}
        title="Нажмите для подробного описания и всех ракурсов"
      >
        <img
          src={pattern.image}
          alt={pattern.title}
          className="catalog-card__img"
          loading="lazy"
        />

        {/* Бейдж количества фото (если их больше 1) */}
        {pattern.images && pattern.images.length > 1 && (
          <span
            className="catalog-card__photos-count"
            title={`Всего ${pattern.images.length} фото`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>{pattern.images.length} фото</span>
          </span>
        )}

        {/* Кнопка добавления в избранное */}
        <button
          type="button"
          className={`catalog-card__wishlist-btn ${isLiked ? "catalog-card__wishlist-btn--active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(pattern.id);
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
        <span className="catalog-card__doll-fit">{pattern.doll}</span>
        <h3
          className="catalog-card__title"
          onClick={handleOpen}
          title={pattern.title}
        >
          {pattern.title}
        </h3>



        {/* Нижняя плашка: цена и корзина */}
        <div className="catalog-card__footer">
          <span className="catalog-card__price">{pattern.priceFormatted}</span>

          <button
            type="button"
            className={`catalog-card__btn-cart ${isInCart ? "catalog-card__btn-cart--added" : ""}`}
            onClick={() => onAddToCart?.(pattern.title)}
          >
            {isInCart ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>В корзине</span>
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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
});

PatternCard.displayName = "PatternCard";

export default PatternCard;
