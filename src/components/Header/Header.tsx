import React, { useState, useEffect } from "react";
import Menu from "../Menu/Menu.tsx";
import { DEFAULT_MENU_ITEMS } from "../Menu/menuData.ts";
import type { MenuItem } from "../Menu/types.ts";
import "./Header.css";

export interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
  onCartClick?: () => void;
  onWishlistClick?: () => void;
  onSearchSubmit?: (query: string) => void;
  menuItems?: MenuItem[];
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount = 0,
  wishlistCount = 0,
  onCartClick,
  onWishlistClick,
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
      {/* Основная шапка */}
      <header className={`header ${isScrolled ? "header--scrolled" : ""} ${className}`}>
        <div className="header__container">
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

          {/* Десктопное меню навигации */}
          <div className="header__nav-wrapper">
            <Menu variant="horizontal" items={menuItems} />
          </div>

          {/* Правая панель действий */}
          <div className="header__actions">
            {/* Поиск */}
            <div className={`header__search-box ${isSearchOpen ? "header__search-box--open" : ""}`}>
              <form onSubmit={handleSearchSubmit} className="header__search-form">
                <input
                  type="text"
                  placeholder="Поиск выкройки..."
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Избранное */}
            <button
              type="button"
              className="header__icon-btn"
              onClick={onWishlistClick}
              aria-label="Избранные выкройки"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
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

            {/* Корзина */}
            <button
              type="button"
              className="header__icon-btn header__icon-btn--cart"
              onClick={onCartClick}
              aria-label="Корзина покупок"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 10a4 4 0 0 1-8 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {cartCount > 0 && (
                <span className="header__badge" aria-label={`Товаров в корзине: ${cartCount}`}>
                  {cartCount}
                </span>
              )}
            </button>
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
