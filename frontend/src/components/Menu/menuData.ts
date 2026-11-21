import type { MenuItem } from "./types.ts";
import type { DollCategory } from "../../pages/ChooseDoll/types.ts";

/**
 * Преобразует категории и привязанных к ним кукол из базы данных в пункты меню.
 */
export function buildMenuItems(
  categories: DollCategory[],
  baseItems: MenuItem[] = BASE_MENU_ITEMS,
): MenuItem[] {
  if (!categories || categories.length === 0) {
    return baseItems;
  }

  const sortedCats = [...categories].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const allPatternsItem: MenuItem = {
    id: "all-patterns",
    label: "Все выкройки каталога",
    href: "#catalog",
  };

  const categoryItems: MenuItem[] = sortedCats.map((cat) => {
    const dolls = cat.dolls || [];
    const allInCatItem: MenuItem = {
      id: `${cat.slug}-all`,
      label: "Все выкройки раздела",
      href: `#${cat.slug}`,
    };

    const dollItems: MenuItem[] = dolls.map((doll) => ({
      id: `doll-${doll.id}`,
      label: doll.nameRu || doll.nameEn,
      href: `#${cat.slug}?doll=${doll.id}`,
      description:
        doll.nameEn && doll.nameEn !== doll.nameRu ? doll.nameEn : undefined,
    }));

    return {
      id: cat.slug || `category-${cat.id}`,
      label: cat.name,
      href: `#${cat.slug}`,
      children: [allInCatItem, ...dollItems],
    };
  });

  const catalogChildren: MenuItem[] = [allPatternsItem, ...categoryItems];

  return baseItems.map((item) => {
    if (item.isDynamic || item.id === "catalog" || item.href === "#catalog") {
      return {
        ...item,
        children: catalogChildren,
      };
    }
    return item;
  });
}

export const BASE_MENU_ITEMS: MenuItem[] = [
  {
    id: "catalog",
    label: "Каталог выкроек",
    href: "#catalog",
    isDynamic: true,
  },
  {
    id: "tutorials",
    label: "Видеоуроки",
    href: "#tutorials",
  },
  {
    id: "courses",
    label: "Курсы",
    href: "#courses",
  },
  {
    id: "free",
    label: "Бесплатно",
    href: "#free",
  },
  {
    id: "useful",
    label: "Полезное",
    href: "#useful",
  },
  {
    id: "about",
    label: "О нас",
    href: "#about",
  },
];

/** @deprecated Используйте BASE_MENU_ITEMS */
export const DEFAULT_MENU_ITEMS = BASE_MENU_ITEMS;
