import React, { useState, useRef, useEffect } from "react";
import type { MenuProps } from "./types.ts";
import { BASE_MENU_ITEMS } from "./menuData.ts";
import { ChevronDownIcon } from "../icons/index.ts";
import { getItemId, isItemActive } from "./menuUtils.ts";
import { MegaPanel, MobileCategories, MenuDrawer } from "./components/index.ts";
import "./menu.css";

export const Menu: React.FC<MenuProps> = ({
  variant = "horizontal",
  isOpen = false,
  onClose,
  items = BASE_MENU_ITEMS,
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
    if (activeHref !== undefined) return;
    const handleHashChange = () => {
      setBrowserHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [activeHref]);

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

  const toggleMobileId = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedMobileIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleToggleL1 = (itemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (variant === "drawer") {
      toggleMobileId(itemId, e);
    } else {
      setActiveL1Id((prev) => (prev === itemId ? null : itemId));
      setActiveL2Id(null);
    }
  };

  const closeAll = () => {
    setActiveL1Id(null);
    setActiveL2Id(null);
    if (variant === "drawer" && onClose) onClose();
  };

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
              <div className="menu__link-wrapper">
                <a
                  href={item.href}
                  target={item.target && item.target !== "_self" ? item.target : undefined}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  className="menu__link"
                  onClick={(e) => {
                    if (hasChildren) {
                      handleToggleL1(itemId, e);
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
                    onClick={(e) => handleToggleL1(itemId, e)}
                  >
                    <span
                      className={`menu__toggle-chevron ${isL1Open || isL1MobileOpen ? "menu__toggle-chevron--open" : ""}`}
                    >
                      <ChevronDownIcon className="menu__chevron" />
                    </span>
                  </button>
                )}
              </div>

              {hasChildren && item.children && (
                <div
                  className={`menu__panel ${(variant === "horizontal" && isL1Open) || (variant === "drawer" && isL1MobileOpen) ? "menu__panel--visible" : ""}`}
                >
                  {variant === "horizontal" ? (
                    <MegaPanel
                      categories={item.children}
                      activeCategoryId={activeL2Id}
                      onSelectCategory={setActiveL2Id}
                      onClose={closeAll}
                    />
                  ) : (
                    <MobileCategories
                      categories={item.children}
                      expandedIds={expandedMobileIds}
                      onToggle={toggleMobileId}
                      onClose={closeAll}
                    />
                  )}
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
      <MenuDrawer isOpen={isOpen} onClose={onClose}>
        {navContent}
      </MenuDrawer>
    );
  }

  return navContent;
};

export default Menu;
