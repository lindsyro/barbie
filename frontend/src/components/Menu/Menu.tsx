import React, { useState, useRef, useEffect } from "react";
import type { MenuItem, MenuProps } from "./types.ts";
import { DEFAULT_MENU_ITEMS } from "./menuData.ts";
import { ChevronDownIcon, ChevronRightIcon, CloseIcon } from "../icons/index.ts";
import "./menu.css";

export const Menu: React.FC<MenuProps> = ({
  variant = "horizontal",
  isOpen = false,
  onClose,
  items = DEFAULT_MENU_ITEMS,
  activeHref,
  className = "",
}) => {
  const menuRef = useRef<HTMLElement | null>(null);
  const [activeL1Id, setActiveL1Id] = useState<string | null>(null);
  const [activeL2Id, setActiveL2Id] = useState<string | null>(null);
  const [expandedMobileIds, setExpandedMobileIds] = useState<string[]>([]);
  const [browserHash, setBrowserHash] = useState<string>(() =>
    typeof window !== "undefined" ? window.location.hash : "",
  );

  useEffect(() => {
    const handleHashChange = () => {
      setBrowserHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const currentTarget = activeHref ?? browserHash;

  useEffect(() => {
    if (variant !== "horizontal") return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveL1Id(null);
        setActiveL2Id(null);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveL1Id(null);
        setActiveL2Id(null);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onEsc);
    };
  }, [variant]);

  const getItemId = (item: MenuItem) => item.id || item.href || item.label;

  const isItemActive = (item: MenuItem, targetHref?: string): boolean => {
    if (!targetHref) return false;
    const cleanTarget = targetHref.replace("#", "").trim();
    if (!cleanTarget || cleanTarget === "main") return false;

    const cleanItemHref = (item.href || "").replace("#", "").trim();
    const itemId = item.id || "";

    // Прямое совпадение по href или id
    if (cleanItemHref && cleanItemHref === cleanTarget) return true;
    if (itemId && itemId === cleanTarget) return true;

    // Рекурсивная проверка дочерних пунктов (категорий и кукол)
    if (item.children && item.children.length > 0) {
      return item.children.some((child) => isItemActive(child, targetHref));
    }

    return false;
  };

  const toggleMobileId = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedMobileIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const closeAll = () => {
    setActiveL1Id(null);
    setActiveL2Id(null);
    if (variant === "drawer" && onClose) onClose();
  };

  // ── Десктоп: панель для "Каталог выкроек" ──────────────────
  const renderMegaPanel = (categories: MenuItem[]) => {
    const selectedCat = categories.find(
      (c) => getItemId(c) === activeL2Id && c.children?.length,
    );

    return (
      <div className={`mega ${selectedCat ? "mega--has-active-sub" : ""}`}>
        {/* Левая колонка: категории */}
        <div className="mega__left">
          <ul className="mega__categories">
            {categories.map((cat) => {
              const catId = getItemId(cat);
              const hasKids = Boolean(cat.children?.length);
              const isSelected = activeL2Id === catId;
              return (
                <li
                  key={catId}
                  className={`mega__cat-item ${isSelected ? "mega__cat-item--active" : ""}`}
                >
                  {hasKids ? (
                    <button
                      type="button"
                      className="mega__cat-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveL2Id(isSelected ? null : catId);
                      }}
                    >
                      <span className="mega__cat-label">{cat.label}</span>
                      <ChevronRightIcon className="menu__chevron-right" />
                    </button>
                  ) : (
                    <a
                      href={cat.href || "#catalog"}
                      className="mega__cat-btn"
                      onClick={closeAll}
                    >
                      <span className="mega__cat-label">{cat.label}</span>
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Правая колонка: появляется сбоку ТОЛЬКО при клике на категорию */}
        {selectedCat && selectedCat.children && (
          <div className="mega__right">
            <div className="mega__right-header">
              <span className="mega__right-title">{selectedCat.label}</span>
              <span className="mega__right-count">
                {selectedCat.children.length}
              </span>
            </div>
            <ul className="mega__sub-list">
              {selectedCat.children.map((sub) => {
                const subId = getItemId(sub);
                return (
                  <li key={subId} className="mega__sub-item">
                    <a
                      href={sub.href}
                      className="mega__sub-link"
                      onClick={closeAll}
                    >
                      <span className="mega__sub-label">{sub.label}</span>
                      {sub.description && (
                        <span className="mega__sub-desc">
                          {sub.description}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // ── Мобильный drawer: аккордеон ──────────────────────────────────────────
  const renderMobileCategories = (categories: MenuItem[]) => (
    <ul className="mobile-cats">
      {categories.map((cat) => {
        const catId = getItemId(cat);
        const hasKids = Boolean(cat.children?.length);
        const isOpen = expandedMobileIds.includes(catId);
        return (
          <li key={catId} className="mobile-cats__item">
            {hasKids ? (
              <button
                type="button"
                className={`mobile-cats__btn ${isOpen ? "mobile-cats__btn--open" : ""}`}
                onClick={(e) => {
                  toggleMobileId(catId, e);
                }}
              >
                <span>{cat.label}</span>
                <span
                  className={`mobile-cats__toggle ${isOpen ? "mobile-cats__toggle--open" : ""}`}
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            ) : (
              <a
                href={cat.href || "#catalog"}
                className="mobile-cats__btn"
                onClick={closeAll}
              >
                <span>{cat.label}</span>
              </a>
            )}
            {hasKids && isOpen && cat.children && (
              <ul className="mobile-cats__sub">
                {cat.children.map((sub) => {
                  const subId = getItemId(sub);
                  return (
                    <li key={subId}>
                      <a
                        href={sub.href}
                        className="mobile-cats__sub-link"
                        onClick={closeAll}
                      >
                        {sub.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );

  // ── Основная навигация ───────────────────────────────────────────────────
  const navContent = (
    <nav
      ref={menuRef}
      className={`menu menu--${variant} ${className}`}
      aria-label="Основное меню"
    >
      <ul className="menu__list">
        {items.map((item) => {
          const itemId = getItemId(item);
          const hasChildren = Boolean(item.children?.length);
          const isL1Open = activeL1Id === itemId;
          const isL1MobileOpen = expandedMobileIds.includes(itemId);
          const isActive = isItemActive(item, currentTarget);

          return (
            <li
              key={itemId}
              className={`menu__item ${hasChildren ? "menu__item--has-children" : ""} ${isL1Open ? "menu__item--open" : ""} ${isActive ? "menu__item--active" : ""}`}
            >
              {/* Верхний пункт */}
              <div className="menu__link-wrapper">
                <a
                  href={item.href}
                  className="menu__link"
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault();
                      if (variant === "drawer") {
                        toggleMobileId(itemId, e);
                      } else {
                        setActiveL1Id(isL1Open ? null : itemId);
                        setActiveL2Id(null);
                      }
                    } else {
                      closeAll();
                    }
                  }}
                >
                  <span className="menu__label">{item.label}</span>
                  {item.badge && (
                    <span className="menu__badge">{item.badge}</span>
                  )}
                </a>
                {hasChildren && (
                  <button
                    type="button"
                    className="menu__toggle"
                    aria-expanded={
                      variant === "drawer" ? isL1MobileOpen : isL1Open
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (variant === "drawer") {
                        toggleMobileId(itemId, e);
                      } else {
                        setActiveL1Id(isL1Open ? null : itemId);
                        setActiveL2Id(null);
                      }
                    }}
                  >
                    <span
                      className={`menu__toggle-chevron ${isL1Open || isL1MobileOpen ? "menu__toggle-chevron--open" : ""}`}
                    >
                      <ChevronDownIcon className="menu__chevron" />
                    </span>
                  </button>
                )}
              </div>

              {/* Выпадающая панель */}
              {hasChildren && item.children && (
                <div
                  className={`menu__panel ${(variant === "horizontal" && isL1Open) || (variant === "drawer" && isL1MobileOpen) ? "menu__panel--visible" : ""}`}
                >
                  {variant === "horizontal"
                    ? renderMegaPanel(item.children)
                    : renderMobileCategories(item.children)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );

  if (variant === "drawer") {
    return (
      <div
        className={`menu-drawer-wrapper ${isOpen ? "menu-drawer-wrapper--open" : ""}`}
      >
        <div
          className="menu-drawer__backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          className="menu-drawer__content"
          role="dialog"
          aria-modal="true"
          aria-label="Мобильное меню"
        >
          <div className="menu-drawer__header">
            <span className="menu-drawer__title">Каталог и навигация</span>
            <button
              type="button"
              className="menu-drawer__close-btn"
              onClick={onClose}
              aria-label="Закрыть меню"
            >
              <CloseIcon size={20} />
            </button>
          </div>
          <div className="menu-drawer__body">{navContent}</div>
          <div className="menu-drawer__footer">
            <p className="menu-drawer__phone">+7 (999) 000-00-00</p>
            <p className="menu-drawer__note">
              PDF отправляется мгновенно после оплаты
            </p>
          </div>
        </div>
      </div>
    );
  }

  return navContent;
};

export default Menu;
