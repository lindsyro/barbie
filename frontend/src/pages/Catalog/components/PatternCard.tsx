import React from "react";
import {
  HeartIcon,
  CartIcon,
  CheckIcon,
  ImageIcon,
} from "@/components/icons/index.ts";
import type { CatalogPatternItem } from "../catalogData.ts";

export interface PatternCardProps {
  pattern: CatalogPatternItem;
  isLiked?: boolean;
  isInCart?: boolean;
  onToggleWishlist?: (patternId: number) => void;
  onAddToCart?: (title: string) => void;
  onOpenPattern?: (pattern: CatalogPatternItem) => void;
}

export const PatternCard: React.FC<PatternCardProps> = React.memo(
  ({
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
              <ImageIcon size={12} />
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
            aria-label={
              isLiked ? "Удалить из избранного" : "Добавить в избранное"
            }
          >
            <HeartIcon size={18} filled={isLiked} />
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
            <span className="catalog-card__price">
              {pattern.priceFormatted}
            </span>

            <button
              type="button"
              className={`catalog-card__btn-cart ${isInCart ? "catalog-card__btn-cart--added" : ""}`}
              onClick={() => onAddToCart?.(pattern.title)}
            >
              {isInCart ? (
                <>
                  <CheckIcon size={14} strokeWidth={2.5} />
                  <span>В корзине</span>
                </>
              ) : (
                <>
                  <CartIcon size={14} />
                  <span>В корзину</span>
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    );
  },
);

PatternCard.displayName = "PatternCard";

export default PatternCard;
