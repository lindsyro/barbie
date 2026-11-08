import React, { useState, useEffect } from "react";
import Menu from "../Menu/Menu.tsx";
import { DEFAULT_MENU_ITEMS } from "../Menu/menuData.ts";
import type { MenuItem } from "../Menu/types.ts";
import "./header.css";

export interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
  onCartClick?: () => void;
  onWishlistClick?: () => void;
  onAuthClick?: () => void;
  onSearchSubmit?: (query: string) => void;
  menuItems?: MenuItem[];
  className?: string;
}

const BASE = import.meta.env.BASE_URL;

export const Header: React.FC<HeaderProps> = ({
  cartCount = 1,
  wishlistCount = 0,
  onCartClick,
  onWishlistClick,
  onAuthClick,
  onSearchSubmit,
  menuItems = DEFAULT_MENU_ITEMS,
  className = "",
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit && searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <>
      <header className={`header ${isScrolled ? "header--scrolled" : ""} ${className}`}>
        {/* 1. Верхняя полоса с соцсетями (золотые иконки справа) */}
        <div className="header__top-bar">
          <div className="header__container header__top-bar-inner">
            <div className="header__socials">
              {/* VK */}
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="header__social-link"
                aria-label="ВКонтакте"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.07 2H8.93C4.16 2 2 4.16 2 8.93v6.14C2 19.84 4.16 22 8.93 22h6.14c4.77 0 6.93-2.16 6.93-6.93V8.93C22 4.16 19.84 2 15.07 2zm3.38 13.91h-1.63c-.62 0-.81-.49-1.92-1.6-.97-.94-1.4-1.06-1.64-1.06-.34 0-.43.1-.43.57v1.54c0 .4-.13.55-1.18.55-1.74 0-3.66-1.06-5.02-3.03-2.05-2.88-2.61-5.06-2.61-5.51 0-.25.1-.48.57-.48h1.63c.42 0 .58.19.74.64.81 2.37 2.18 4.45 2.74 4.45.21 0 .31-.1.31-.64V9.82c-.06-1.15-.67-1.25-.67-1.66 0-.2.17-.4.43-.4h2.7c.36 0 .49.19.49.62v3.38c0 .36.16.49.27.49.21 0 .39-.13.78-.52 1.22-1.37 2.08-3.48 2.08-3.48.11-.25.32-.49.74-.49h1.63c.51 0 .62.26.51.62-.22.99-2.3 3.93-2.3 3.93-.18.3-.25.43 0 .77.18.25.77.75 1.16 1.21 1.05 1.14 1.48 1.67 1.48 1.67.29.38.16.58-.33.58z" />
                </svg>
              </a>

              {/* Целевой кружок / OK */}
              <a
                href="#social"
                className="header__social-link"
                aria-label="Сообщество"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="header__social-link"
                aria-label="WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              {/* Видео / YouTube (Play) */}
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="header__social-link"
                aria-label="YouTube"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 2. Блок с логотипом над меню (логотип слева, действия справа) */}
        <div className="header__logo-block">
          <div className="header__container header__logo-block-inner">
            {/* Кнопка бургер-меню для мобильных */}
            <button
              type="button"
              className="header__burger-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Открыть главное меню"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Логотип */}
            <a href="#main" className="header__logo-link" aria-label="GOOSE Fashion House — Главная">
              <img
                src={`${BASE}logo.png`}
                alt="GOOSE FASHION HOUSE"
                className="header__logo-img"
              />
            </a>

            {/* Правая панель: Вход/Регистрация, Поиск, Избранное, Корзина */}
            <div className="header__actions">
              {/* Вход / Регистрация */}
              <button
                type="button"
                className="header__auth-btn"
                onClick={onAuthClick}
                aria-label="Вход или регистрация"
              >
                <svg
                  className="header__auth-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
                </svg>
                <span className="header__auth-text">Вход/Регистрация</span>
              </button>

              {/* Поиск */}
              <div className={`header__search-box ${isSearchOpen ? "header__search-box--open" : ""}`}>
                <form onSubmit={handleSearchSubmit} className="header__search-form">
                  <input
                    type="text"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="header__search-input"
                  />
                </form>
                <button
                  type="button"
                  className="header__icon-btn"
                  onClick={() => setIsSearchOpen((prev) => !prev)}
                  aria-label="Поиск по сайту"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Избранное (сердечко) */}
              <button
                type="button"
                className="header__icon-btn"
                onClick={onWishlistClick}
                aria-label="Избранные выкройки"
              >
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {wishlistCount > 0 && (
                  <span className="header__badge" aria-label={`Избранных товаров: ${wishlistCount}`}>
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Корзина (с тёмным круглым бейджем) */}
              <button
                type="button"
                className="header__icon-btn header__icon-btn--cart"
                onClick={onCartClick}
                aria-label="Корзина покупок"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="9" cy="21" r="1" fill="currentColor" />
                  <circle cx="20" cy="21" r="1" fill="currentColor" />
                  <path
                    d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="header__cart-badge" aria-label={`Товаров в корзине: ${cartCount}`}>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Меню навигации под блоком логотипа */}
        <div className="header__nav-row">
          <div className="header__container header__nav-row-inner">
            <Menu variant="horizontal" items={menuItems} />
          </div>
        </div>
      </header>

      {/* Мобильное выпадающее меню (Drawer) */}
      <Menu
        variant="drawer"
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        items={menuItems}
      />
    </>
  );
};

export default Header;
