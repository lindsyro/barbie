import { useState, useMemo, useCallback } from "react";
import { useAsyncData } from "@/hooks/index.ts";
import { fetchPatterns } from "@/api/patterns.ts";
import type { CatalogPatternItem } from "./catalogData.ts";
import {
  getCategoryName,
  findDollById,
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

  // Универсальная загрузка выкроек из базы данных PostgreSQL
  const { data: fetchedPatterns = [], isLoading: internalLoading } =
    useAsyncData(fetchPatterns, {
      initialData: [],
      enabled: !propPatterns || propPatterns.length === 0,
    });

  const patterns =
    propPatterns && propPatterns.length > 0 ? propPatterns : fetchedPatterns;
  const isLoading = propIsLoading ?? internalLoading;

  // Состояние фильтрации
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory || "all",
  );
  const [activeDollId, setActiveDollId] = useState<number | null>(initialDollId);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Вспомогательные вычисления (catalogUtils)
  const currentCategoryName = useMemo(
    () => getCategoryName(patterns, activeCategory),
    [patterns, activeCategory],
  );

  const selectedDoll = useMemo(
    () => findDollById(patterns, activeDollId),
    [patterns, activeDollId],
  );

  const filteredPatterns = useMemo(
    () =>
      filterPatterns(patterns, {
        activeCategory,
        activeDollId,
        searchQuery,
      }),
    [patterns, activeCategory, activeDollId, searchQuery],
  );

  const handleResetToCatalog = useCallback(() => {
    setActiveCategory("all");
    setActiveDollId(null);
    window.location.hash = "catalog";
  }, []);

  const handleResetDoll = useCallback(() => {
    setActiveDollId(null);
    window.location.hash = activeCategory;
  }, [activeCategory]);

  const handleResetFilters = useCallback(() => {
    setActiveCategory("all");
    setActiveDollId(null);
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
    () => getCatalogTitle(activeCategory, selectedDoll, currentCategoryName),
    [activeCategory, selectedDoll, currentCategoryName],
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
