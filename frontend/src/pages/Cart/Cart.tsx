import React, { useState } from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import type { CartProps } from "./types.ts";
import "./cart.css";
import "../pages.css";

export const Cart: React.FC<CartProps> = ({
  items,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onContinueShopping,
  onBackToMain,
}) => {
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Подсчет стоимости
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const discountPercent = appliedPromo === "GOOSE10" ? 0.1 : 0;
  const discountAmount = Math.round(subtotal * discountPercent);
  const total = subtotal - discountAmount;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoCodeInput.trim().toUpperCase();

    if (!code) {
      setPromoError("Введите промокод");
      return;
    }

    if (code === "GOOSE10") {
      setAppliedPromo("GOOSE10");
      setPromoCodeInput("");
    } else {
      setPromoError("Промокод не найден или срок действия истек");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  return (
    <div className="page-container">
      {/* Хлебные крошки */}
      <Breadcrumbs current="Корзина" onBackToMain={onBackToMain} />

      {/* Заголовок страницы */}
      <div className="page-header">
        <span className="page-header__subtitle">Оформление заказа</span>
        <h1 className="page-header__title">Корзина покупок</h1>
        <div className="page-header__line" />
      </div>

      {/* Контент: если корзина пуста */}
      {items.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty__icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="21" r="1" fill="currentColor" />
              <circle cx="20" cy="21" r="1" fill="currentColor" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="cart-empty__title">Ваша корзина пуста</h2>
          <p className="cart-empty__desc">
            Вы пока не добавили ни одной PDF-выкройки. В нашем каталоге вы найдете точные лекала для Барби, Кена, MiniFee и других кукол.
          </p>
          <a
            href="#catalog"
            onClick={(e) => {
              e.preventDefault();
              onContinueShopping?.();
            }}
            className="cart-empty__btn"
          >
            ← Перейти в каталог выкроек
          </a>
        </div>
      ) : (
        /* Двухколоночный макет корзины */
        <div className="cart-layout">
          {/* Левая колонка: список выкроек */}
          <div className="cart-main">
            <div className="cart-card">
              <div className="cart-card__header">
                <h2 className="cart-card__title">
                  Выкройки в заказе
                  <span className="cart-card__count">({items.length})</span>
                </h2>
                {onClearCart && items.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="cart-card__clear-btn"
                    title="Очистить всю корзину"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>Очистить корзину</span>
                  </button>
                )}
              </div>

              {/* Список позиций */}
              <div className="cart-items-list">
                {items.map((item) => (
                  <article key={item.id} className="cart-item">
                    {/* Фото выкройки */}
                    <div className="cart-item__img-box">
                      <img src={item.image} alt={item.title} className="cart-item__img" />
                    </div>

                    {/* Информация */}
                    <div className="cart-item__info">
                      {item.tag && <span className="cart-item__tag">{item.tag}</span>}
                      <h3 className="cart-item__title">{item.title}</h3>
                      <p className="cart-item__doll">{item.doll}</p>
                      <span className="cart-item__digital-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        PDF на А4 • Мгновенно на email
                      </span>
                    </div>

                    {/* Цена */}
                    <div className="cart-item__price-box">
                      <span className="cart-item__price">{item.priceFormatted}</span>
                      <span className="cart-item__price-note">1 файл выкройки</span>
                    </div>

                    {/* Кнопка удаления */}
                    <button
                      type="button"
                      className="cart-item__remove-btn"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`Удалить ${item.title}`}
                      title="Удалить из корзины"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </article>
                ))}
              </div>
            </div>

            {/* Ссылка "Продолжить покупки" */}
            <div className="cart-actions-row">
              <a
                href="#catalog"
                onClick={(e) => {
                  e.preventDefault();
                  onContinueShopping?.();
                }}
                className="cart-continue-link"
              >
                ← Вернуться в каталог за другими выкройками
              </a>
            </div>
          </div>

          {/* Правая колонка: сводка заказа */}
          <aside className="cart-summary">
            <h2 className="cart-summary__title">Сводка заказа</h2>

            {/* Ввод промокода */}
            <div className="cart-promo">
              {appliedPromo ? (
                <div className="cart-promo__applied">
                  <span>Промокод {appliedPromo} (-10%) применен</span>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="cart-promo__remove-btn"
                    title="Удалить промокод"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="cart-promo__form">
                  <input
                    type="text"
                    placeholder="Промокод (GOOSE10)"
                    value={promoCodeInput}
                    onChange={(e) => {
                      setPromoCodeInput(e.target.value);
                      if (promoError) setPromoError(null);
                    }}
                    className="cart-promo__input"
                  />
                  <button type="submit" className="cart-promo__btn">
                    Применить
                  </button>
                </form>
              )}
              {promoError && (
                <span style={{ fontSize: "0.75rem", color: "#c94a4a", marginTop: "0.2rem" }}>
                  {promoError}
                </span>
              )}
            </div>

            {/* Строки цен */}
            <div className="cart-summary__rows">
              <div className="cart-summary__row">
                <span>Выкройки ({items.length} шт.):</span>
                <span>{subtotal.toLocaleString("ru-RU")} ₽</span>
              </div>

              {discountAmount > 0 && (
                <div className="cart-summary__row cart-summary__row--discount">
                  <span>Скидка по промокоду (10%):</span>
                  <span>-{discountAmount.toLocaleString("ru-RU")} ₽</span>
                </div>
              )}

              <div className="cart-summary__row">
                <span>Доставка:</span>
                <span style={{ color: "#3b7c52" }}>Бесплатно (электронная)</span>
              </div>

              <div className="cart-summary__divider" />

              <div className="cart-summary__total-row">
                <span className="cart-summary__total-label">Итого:</span>
                <span className="cart-summary__total-value">{total.toLocaleString("ru-RU")} ₽</span>
              </div>
            </div>

            {/* Кнопка оформления заказа */}
            <button
              type="button"
              className="cart-checkout-btn"
              onClick={onCheckout}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Оформить заказ</span>
            </button>

            {/* Блок преимуществ и безопасности */}
            <div className="cart-guarantees">
              <div className="cart-guarantee-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Ссылки на PDF-файлы придут на email сразу после оплаты</span>
              </div>
              <div className="cart-guarantee-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Бессрочный доступ к купленным выкройкам в личном кабинете</span>
              </div>
              <div className="cart-guarantee-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Формат А4 с контрольным квадратом 100% для точной посадки</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
