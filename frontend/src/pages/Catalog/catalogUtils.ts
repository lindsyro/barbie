import type { CatalogPatternItem } from "./types.ts";
import type { DollItem } from "../ChooseDoll/types.ts";
import type { BreadcrumbItem } from "@/components/Breadcrumbs/Breadcrumbs.tsx";

export interface FilterPatternsOptions {
  activeCategory: string;
  activeDollId: number | null;
  searchQuery: string;
}

/**
 * Находит название категории кукол из списка выкроек
 */
export function getCategoryName(
  patterns: CatalogPatternItem[],
  activeCategory: string,
): string {
  if (activeCategory === "all") return "Все выкройки";
  for (const p of patterns) {
    for (const d of p.dolls) {
      if (d.category?.slug === activeCategory && d.category.name) {
        return d.category.name;
      }
    }
  }
  return "Каталог";
}

/**
 * Находит объект куклы по ID среди всех выкроек
 */
export function findDollById(
  patterns: CatalogPatternItem[],
  dollId: number | null,
): DollItem | null {
  if (!dollId) return null;
  for (const p of patterns) {
    const found = p.dolls.find((d) => d.id === dollId);
    if (found) return found;
  }
  return null;
}

/**
 * Фильтрует выкройки по категории, кукле и поисковому запросу
 */
export function filterPatterns(
  patterns: CatalogPatternItem[],
  options: FilterPatternsOptions,
): CatalogPatternItem[] {
  const { activeCategory, activeDollId, searchQuery } = options;

  return patterns.filter((item) => {
    // 1. Фильтр по категории
    if (activeCategory !== "all") {
      const matchesCategory = item.dolls.some(
        (d) => d.category?.slug === activeCategory,
      );
      if (!matchesCategory) {
        return false;
      }
    }

    // 2. Фильтр по конкретной кукле
    if (activeDollId) {
      const fitsDoll = item.dolls.some((d) => d.id === activeDollId);
      if (!fitsDoll) {
        return false;
      }
    }

    // 3. Поиск по названию или кукле
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inTitle = item.title.toLowerCase().includes(q);
      const inDoll = item.doll.toLowerCase().includes(q);
      return inTitle || inDoll;
    }
    return true;
  });
}

export interface BreadcrumbsTrailOptions {
  activeCategory: string;
  selectedDoll: DollItem | null;
  categoryName: string;
  onBackToMain?: () => void;
  onResetToCatalog: () => void;
  onResetDoll: () => void;
}

export interface BreadcrumbsData {
  trail: BreadcrumbItem[];
  current: string;
}

/**
 * Строит цепочку хлебных крошек каталога
 */
export function buildCatalogBreadcrumbs(
  options: BreadcrumbsTrailOptions,
): BreadcrumbsData {
  const {
    activeCategory,
    selectedDoll,
    categoryName,
    onBackToMain,
    onResetToCatalog,
    onResetDoll,
  } = options;

  const trail: BreadcrumbItem[] = [
    { label: "Главная", href: "#main", onClick: onBackToMain },
  ];

  if (activeCategory === "all" && !selectedDoll) {
    return { trail, current: "Каталог выкроек" };
  }

  trail.push({
    label: "Каталог",
    href: "#catalog",
    onClick: onResetToCatalog,
  });

  if (selectedDoll) {
    trail.push({
      label: categoryName,
      href: `#${activeCategory}`,
      onClick: onResetDoll,
    });
    return {
      trail,
      current: selectedDoll.nameRu || selectedDoll.nameEn,
    };
  }

  return {
    trail,
    current: categoryName,
  };
}

/**
 * Формирует заголовок для страницы каталога
 */
export function getCatalogTitle(
  activeCategory: string,
  selectedDoll: DollItem | null,
  categoryName: string,
): string {
  if (selectedDoll) {
    return `Выкройки`;
  }
  return activeCategory === "all" ? "Каталог выкроек" : categoryName;
}
