import { useState, useMemo, useCallback, useDeferredValue } from "react";
import { useAsyncData } from "@/hooks/index.ts";
import { fetchPatterns } from "@/api/patterns.ts";
import type { CatalogPatternItem } from "./types.ts";
import type { DollItem } from "../ChooseDoll/types.ts";
import {
  filterPatterns,
  buildCatalogBreadcrumbs,
  getCatalogTitle,
} from "./catalogUtils.ts";
import type { CatalogProps } from "./Catalog.tsx";

export function useCatalog(props: CatalogProps) {
  const {
    patterns: propPatterns,
    isLoading: propIsLoading,
    initialCategory = "all",
    initialDollId = null,
    onBackToMain,
    wishlistIds = [],
    cartItems = [],
  } = props;

  // Загрузка выкроек из базы данных (выполняется только если родительский компонент не передал propPatterns)
  const { data: fetchedPatterns = [], isLoading: internalLoading } =
    useAsyncData(fetchPatterns, {
      initialData: [],
      enabled: propPatterns === undefined,
    });

  const patterns = propPatterns ?? fetchedPatterns;
  const isLoading = propIsLoading ?? internalLoading;

  // Категория и кукла синхронизированы с роутером (URL hash — единый источник истины)
  const activeCategory = initialCategory || "all";
  const activeDollId = initialDollId ?? null;

  // Локальный поисковый запрос с неблокирующей отложенной фильтрацией (React 19)
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Модальное окно быстрого просмотра
  const [selectedPattern, setSelectedPattern] =
    useState<CatalogPatternItem | null>(null);

  const handleOpenPattern = useCallback((item: CatalogPatternItem) => {
    setSelectedPattern(item);
  }, []);

  const handleClosePattern = useCallback(() => {
    setSelectedPattern(null);
  }, []);

  const wishlistSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);
  const cartTitlesSet = useMemo(
    () => new Set(cartItems.map((c) => c.title)),
    [cartItems],
  );

  // O(1) индексы категорий и кукол из загруженных выкроек
  const { categoryMap, dollMap } = useMemo(() => {
    const categoryMap = new Map<string, string>();
    const dollMap = new Map<number, DollItem>();

    for (const p of patterns) {
      if (Array.isArray(p.dolls)) {
        for (const d of p.dolls) {
          if (d.category?.slug && d.category.name && !categoryMap.has(d.category.slug)) {
            categoryMap.set(d.category.slug, d.category.name);
          }
          if (d.id && !dollMap.has(d.id)) {
            dollMap.set(d.id, d);
          }
        }
      }
    }
    return { categoryMap, dollMap };
  }, [patterns]);

  const currentCategoryName = useMemo(() => {
    if (activeCategory === "all") return "Все выкройки";
    return categoryMap.get(activeCategory) || "Каталог";
  }, [categoryMap, activeCategory]);

  const selectedDoll = useMemo(() => {
    if (!activeDollId) return null;
    return dollMap.get(activeDollId) || null;
  }, [dollMap, activeDollId]);

  // Фильтрация с использованием отложенного поискового запроса (не блокирует ввод)
  const filteredPatterns = useMemo(
    () =>
      filterPatterns(patterns, {
        activeCategory,
        activeDollId,
        searchQuery: deferredSearchQuery,
      }),
    [patterns, activeCategory, activeDollId, deferredSearchQuery],
  );

  const handleResetToCatalog = useCallback(() => {
    window.location.hash = "catalog";
  }, []);

  const handleResetDoll = useCallback(() => {
    window.location.hash = activeCategory;
  }, [activeCategory]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    window.location.hash = "catalog";
  }, []);

  const breadcrumbsData = useMemo(
    () =>
      buildCatalogBreadcrumbs({
        activeCategory,
        selectedDoll,
        categoryName: currentCategoryName,
        onBackToMain,
        onResetToCatalog: handleResetToCatalog,
        onResetDoll: handleResetDoll,
      }),
    [
      activeCategory,
      selectedDoll,
      currentCategoryName,
      onBackToMain,
      handleResetToCatalog,
      handleResetDoll,
    ],
  );

  const catalogTitle = useMemo(
    () =>
      getCatalogTitle(
        activeCategory,
        selectedDoll,
        currentCategoryName,
        filteredPatterns.length,
      ),
    [activeCategory, selectedDoll, currentCategoryName, filteredPatterns.length],
  );

  return {
    patterns,
    isLoading,
    searchQuery,
    setSearchQuery,
    activeCategory,
    activeDollId,
    selectedDoll,
    filteredPatterns,
    wishlistSet,
    cartTitlesSet,
    selectedPattern,
    handleOpenPattern,
    handleClosePattern,
    catalogTitle,
    breadcrumbsData,
    handleResetFilters,
    handleResetDoll,
    handleResetToCatalog,
  };
}
