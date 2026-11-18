import React from "react";
import {
  HeartIcon,
  CartIcon,
  CheckIcon,
  ImageIcon,
} from "@/components/icons/index.ts";
import type { CatalogPatternItem } from "@/pages/Catalog/types.ts";
import "./patternCard.css";

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

    const photosCount = pattern.images?.length || 1;

    return (
      <article className="catalog-card">
        {/* Блок изображения выкройки */}
        <div
          className="catalog-card__img-box"
          onClick={handleOpen}
          title="Нажмите для быстрого просмотра"
        >
          <img
            src={pattern.image}
            alt={pattern.title}
            className="catalog-card__img"
            loading="lazy"
          />

          {/* Счетчик дополнительных фото */}
          {photosCount > 1 && (
            <span
              className="catalog-card__photos-count"
              title={`Всего ${photosCount} фото`}
            >
              <ImageIcon size={12} />
              <span>{photosCount}</span>
            </span>
          )}

          {/* Кнопка "В избранное" (лайк) */}
          <button
            type="button"
            className={`catalog-card__wishlist-btn ${isLiked ? "catalog-card__wishlist-btn--active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist?.(pattern.id);
            }}
            aria-label={
              isLiked
                ? `Удалить ${pattern.title} из избранного`
                : `Добавить ${pattern.title} в избранное`
            }
            title={isLiked ? "В избранном" : "Добавить в избранное"}
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
            <span className="catalog-card__price">{pattern.price} ₽</span>

            <button
              type="button"
              className={`catalog-card__btn-cart ${isInCart ? "catalog-card__btn-cart--added" : ""}`}
              onClick={() => onAddToCart?.(pattern.title)}
              title={isInCart ? "Убрать из корзины" : "Добавить в корзину"}
              aria-label={
                isInCart
                  ? `Убрать из корзины: ${pattern.title}`
                  : `Добавить в корзину: ${pattern.title}`
              }
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
