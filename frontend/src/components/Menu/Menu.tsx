import React, { useState, useRef, useEffect } from "react";
import type { MenuItem, MenuProps } from "./types.ts";
import { DEFAULT_MENU_ITEMS } from "./menuData.ts";
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
  const [browserHash, setBrowserHash] = useState<string>(
    () => (typeof window !== "undefined" ? window.location.hash : "")
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
      if (e.key === "Escape") { setActiveL1Id(null); setActiveL2Id(null); }
    };
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onClickOutside); window.removeEventListener("keydown", onEsc); };
  }, [variant]);

  const getItemId = (item: MenuItem) => item.id || item.href || item.label;

  const isItemActive = (item: MenuItem, targetHref?: string): boolean => {
    if (!targetHref) return false;
    const cleanTarget = targetHref.replace("#", "").trim();
    if (!cleanTarget || cleanTarget === "main") return false;

    const cleanItemHref = (item.href || "").replace("#", "").trim();
    const itemId = item.id || "";

    if (cleanItemHref && cleanItemHref === cleanTarget) return true;
    if (itemId && itemId === cleanTarget) return true;

    // Если это каталог ("catalog"), то все страницы каталога и выкроек активируют пункт "Каталог выкроек"
    if (itemId === "catalog") {
      const catalogRoutes = [
        "catalog",
        "all-patterns",
        "girls-1-6",
        "barbie",
        "barbie-standard",
        "barbie-curvy",
        "barbie-petite",
        "barbie-tall",
        "barbie-90s",
        "poppy-parker",
        "blythe",
        "girls-1-4",
        "barbie2",
        "girls-1",
        "girls-2",
        "girls-3",
        "guys",
        "ken",
        "ken-standard",
        "ken-broad",
        "adonis-2-0",
        "it-homme",
        "minifee-boy",
        "guys-outerwear",
        "kids",
        "children",
        "chelsea",
        "lati-yellow",
        "middie-obitsu",
      ];
      if (catalogRoutes.includes(cleanTarget)) return true;
    }

    if (item.children && item.children.length > 0) {
      return item.children.some((child) => isItemActive(child, targetHref));
    }

    return false;
  };

  const toggleMobileId = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedMobileIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const closeAll = () => {
    setActiveL1Id(null);
    setActiveL2Id(null);
    if (variant === "drawer" && onClose) onClose();
  };

  const chevron = (
    <svg className="menu__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const chevronRight = (
    <svg className="menu__chevron-right" width="10" height="10" viewBox="0 0 12 12" fill="none">
      <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  // ── Десктоп: панель для "Каталог выкроек" ──────────────────
  const renderMegaPanel = (categories: MenuItem[]) => {
    const selectedCat = categories.find((c) => getItemId(c) === activeL2Id && c.children?.length);

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
                  <button
                    type="button"
                    className="mega__cat-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasKids) {
                        setActiveL2Id(isSelected ? null : catId);
                      }
                    }}
                  >
                    <span className="mega__cat-label">{cat.label}</span>
                    {hasKids && chevronRight}
                  </button>
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
              <span className="mega__right-count">{selectedCat.children.length}</span>
            </div>
            <ul className="mega__sub-list">
              {selectedCat.children.map((sub) => {
                const subId = getItemId(sub);
                return (
                  <li key={subId} className="mega__sub-item">
                    <a href={sub.href} className="mega__sub-link" onClick={closeAll}>
                      <span className="mega__sub-label">{sub.label}</span>
                      {sub.description && (
                        <span className="mega__sub-desc">{sub.description}</span>
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
            <button
              type="button"
              className={`mobile-cats__btn ${isOpen ? "mobile-cats__btn--open" : ""}`}
              onClick={(e) => {
                if (hasKids) {
                  toggleMobileId(catId, e);
                }
              }}
            >
              <span>{cat.label}</span>
              {hasKids && (
                <span className={`mobile-cats__toggle ${isOpen ? "mobile-cats__toggle--open" : ""}`}>
                  {isOpen ? "−" : "+"}
                </span>
              )}
            </button>
            {hasKids && isOpen && cat.children && (
              <ul className="mobile-cats__sub">
                {cat.children.map((sub) => {
                  const subId = getItemId(sub);
                  return (
                    <li key={subId}>
                      <a href={sub.href} className="mobile-cats__sub-link" onClick={closeAll}>
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
    <nav ref={menuRef} className={`menu menu--${variant} ${className}`} aria-label="Основное меню">
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
                  {item.badge && <span className="menu__badge">{item.badge}</span>}
                </a>
                {hasChildren && (
                  <button
                    type="button"
                    className="menu__toggle"
                    aria-expanded={variant === "drawer" ? isL1MobileOpen : isL1Open}
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
                    <span className={`menu__toggle-chevron ${isL1Open || isL1MobileOpen ? "menu__toggle-chevron--open" : ""}`}>
                      {chevron}
                    </span>
                  </button>
                )}
              </div>

              {/* Выпадающая панель */}
              {hasChildren && item.children && (
                <div className={`menu__panel ${(variant === "horizontal" && isL1Open) || (variant === "drawer" && isL1MobileOpen) ? "menu__panel--visible" : ""}`}>
                  {variant === "horizontal"
                    ? renderMegaPanel(item.children)
                    : renderMobileCategories(item.children)
                  }
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
      <div className={`menu-drawer-wrapper ${isOpen ? "menu-drawer-wrapper--open" : ""}`}>
        <div className="menu-drawer__backdrop" onClick={onClose} aria-hidden="true" />
        <div className="menu-drawer__content" role="dialog" aria-modal="true" aria-label="Мобильное меню">
          <div className="menu-drawer__header">
            <span className="menu-drawer__title">Каталог и навигация</span>
            <button type="button" className="menu-drawer__close-btn" onClick={onClose} aria-label="Закрыть меню">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="menu-drawer__body">{navContent}</div>
          <div className="menu-drawer__footer">
            <p className="menu-drawer__phone">+7 (999) 000-00-00</p>
            <p className="menu-drawer__note">PDF отправляется мгновенно после оплаты</p>
          </div>
        </div>
      </div>
    );
  }

  return navContent;
};

export default Menu;
