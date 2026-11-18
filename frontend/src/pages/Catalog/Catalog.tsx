import React, { useState, useMemo } from "react";
import {
  Breadcrumbs,
  PageHeader,
  SearchInput,
  UserIcon,
} from "@/components/index.ts";
import { useAsyncData } from "@/hooks/index.ts";
import { fetchPatterns } from "@/api/patterns.ts";
import type { CatalogPatternItem } from "./catalogData.ts";
import { PatternCard, PatternModal } from "./components/index.ts";
import "./catalog.css";

export interface CatalogProps {
  patterns?: CatalogPatternItem[];
  isLoading?: boolean;
  initialCategory?: string;
  initialDollId?: number | null;
  onBackToMain?: () => void;
  onAddToCart?: (title: string) => void;
  onToggleWishlist?: (patternId: number) => void;
  wishlistIds?: number[];
  cartItems?: { id?: number; title: string }[];
  onNavigateToChooseDoll?: () => void;
}

export const Catalog: React.FC<CatalogProps> = ({
  patterns: propPatterns,
  isLoading: propIsLoading,
  initialCategory = "all",
  initialDollId = null,
  onBackToMain,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  cartItems = [],
  onNavigateToChooseDoll,
}) => {
  // Универсальная загрузка выкроек из базы данных PostgreSQL
  const { data: fetchedPatterns = [], isLoading: internalLoading } =
    useAsyncData(fetchPatterns, {
      initialData: [],
      enabled: !propPatterns || propPatterns.length === 0,
    });

  const patterns =
    propPatterns && propPatterns.length > 0 ? propPatterns : fetchedPatterns;
  const isLoading = propIsLoading ?? internalLoading;

  // Выбранная категория (slug)
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory || "all",
  );

  // Выбранная кукла (ID)
  const [activeDollId, setActiveDollId] = useState<number | null>(
    initialDollId,
  );

  // Поисковая строка и сортировка
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "price_asc" | "price_desc">(
    "popular",
  );

  // Модальное окно быстрого просмотра
  const [selectedPattern, setSelectedPattern] =
    useState<CatalogPatternItem | null>(null);

  const handleOpenPattern = (item: CatalogPatternItem) => {
    setSelectedPattern(item);
  };

  const wishlistSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);
  const cartTitlesSet = useMemo(
    () => new Set(cartItems.map((c) => c.title)),
    [cartItems],
  );

  // Находим название категории из реальных данных кукол и выкроек
  const currentCategoryName = useMemo(() => {
    if (activeCategory === "all") return "Все выкройки";
    for (const p of patterns) {
      for (const d of p.dolls || []) {
        const cat = (
          d as unknown as { category?: { slug: string; name: string } }
        ).category;
        if (cat?.slug === activeCategory && cat?.name) {
          return cat.name;
        }
      }
    }
    return "Каталог";
  }, [patterns, activeCategory]);

  // Список кукол категории для подзаголовка
  const categorySubtitle = useMemo(() => {
    if (activeCategory === "all") {
      return "Авторские PDF-лекала GOOSE Fashion House";
    }
    const dollNames = new Set<string>();
    for (const p of patterns) {
      for (const d of p.dolls || []) {
        const cat = (d as unknown as { category?: { slug: string } }).category;
        if (cat?.slug === activeCategory) {
          dollNames.add(d.nameRu || d.nameEn);
        }
      }
    }
    if (dollNames.size > 0) {
      return Array.from(dollNames).join(", ");
    }
    return "Авторские PDF-лекала GOOSE Fashion House";
  }, [patterns, activeCategory]);

  // Находим данные выбранной куклы (для заголовка, крошек и фильтра)
  const selectedDoll = useMemo(() => {
    if (!activeDollId) return null;
    for (const p of patterns) {
      const found = p.dolls?.find((d) => d.id === activeDollId);
      if (found) return found;
    }
    return null;
  }, [patterns, activeDollId]);

  // Фильтрация и сортировка выкроек
  const filteredPatterns = useMemo(() => {
    let result = patterns.filter((item) => {
      // 1. Фильтр по категории
      if (activeCategory !== "all") {
        const matchesCategory =
          item.category === activeCategory ||
          item.dolls?.some(
            (d) =>
              (d as unknown as { category?: { slug: string } })?.category
                ?.slug === activeCategory,
          );
        if (!matchesCategory) {
          return false;
        }
      }

      // 2. Фильтр по конкретной кукле
      if (activeDollId) {
        const fitsDoll = item.dolls?.some((d) => d.id === activeDollId);
        if (!fitsDoll) {
          return false;
        }
      }

      // 3. Поиск
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDoll = item.doll.toLowerCase().includes(q);
        return inTitle || inDoll;
      }
      return true;
    });

    // Сортировка
    if (sortBy === "price_asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [patterns, activeCategory, activeDollId, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setActiveCategory("all");
    setActiveDollId(null);
    setSearchQuery("");
    setSortBy("popular");
    window.location.hash = "catalog";
  };

  // Полноценная цепочка хлебных крошек
  const breadcrumbsData = useMemo(() => {
    const trail: { label: string; href?: string; onClick?: () => void }[] = [
      { label: "Главная", href: "#main", onClick: onBackToMain },
    ];

    if (activeCategory === "all" && !selectedDoll) {
      return { trail, current: "Каталог выкроек" };
    }

    trail.push({
      label: "Каталог",
      href: "#catalog",
      onClick: () => {
        setActiveCategory("all");
        setActiveDollId(null);
        window.location.hash = "catalog";
      },
    });

    if (selectedDoll) {
      trail.push({
        label: currentCategoryName,
        href: `#${activeCategory}`,
        onClick: () => {
          setActiveDollId(null);
          window.location.hash = activeCategory;
        },
      });
      return {
        trail,
        current: selectedDoll.nameRu || selectedDoll.nameEn,
      };
    }

    return {
      trail,
      current: currentCategoryName,
    };
  }, [activeCategory, selectedDoll, currentCategoryName, onBackToMain]);

  return (
    <div className="page-container catalog-page">
      {/* Верхняя строка: хлебные крошки слева, компактный поиск справа */}
      <div className="page-top-bar">
        <Breadcrumbs
          items={breadcrumbsData.trail}
          current={breadcrumbsData.current}
          onBackToMain={onBackToMain}
        />
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск выкройки..."
        />
      </div>

      {/* Динамический заголовок страницы */}
      <PageHeader
        title={
          selectedDoll
            ? `Выкройки`
            : activeCategory === "all"
              ? "Каталог выкроек"
              : currentCategoryName
        }
        subtitle={
          selectedDoll
            ? `${selectedDoll.nameRu}${selectedDoll.nameEn && selectedDoll.nameEn !== selectedDoll.nameRu ? ` (${selectedDoll.nameEn})` : ""}`
            : ""
        }
      />

      {/* 2. Сетка выкроек или статус загрузки */}
      {isLoading && patterns.length === 0 ? (
        <div className="catalog-empty">
          <p className="catalog-empty__desc">
            Загрузка выкроек из базы данных...
          </p>
        </div>
      ) : filteredPatterns.length === 0 ? (
        <div className="catalog-empty">
          <h3 className="catalog-empty__title">Выкройки не найдены</h3>
          <p className="catalog-empty__desc">
            По заданным фильтрам и поисковому запросу «{searchQuery}» пока
            ничего нет.
          </p>
          <button
            type="button"
            className="catalog-empty__btn"
            onClick={handleResetFilters}
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="catalog-grid">
          {filteredPatterns.map((item) => (
            <PatternCard
              key={item.id}
              pattern={item}
              isLiked={wishlistSet.has(item.id)}
              isInCart={cartTitlesSet.has(item.title)}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={onAddToCart}
              onOpenPattern={handleOpenPattern}
            />
          ))}
        </div>
      )}

      {/* 3. Баннер анатомического справочника кукол */}
      <div className="catalog-guide-banner">
        <div className="catalog-guide-banner__info">
          <h3 className="catalog-guide-banner__title">
            Не уверены, подойдёт ли выкройка вашей кукле?
          </h3>
          <p className="catalog-guide-banner__desc">
            Используйте наш «Анатомический справочник GOOSE». В нём собраны 27
            типов тел (Барби, Кен, MiniFee, Блайз) с точными мерками обхвата
            груди, талии и бёдер.
          </p>
        </div>
        <button
          type="button"
          className="catalog-guide-banner__btn"
          onClick={() => {
            if (onNavigateToChooseDoll) {
              onNavigateToChooseDoll();
            } else {
              window.location.hash = "choose-doll";
            }
          }}
        >
          <UserIcon size={16} />
          <span>Выбрать куклу по меркам</span>
        </button>
      </div>

      {/* 4. Модальное окно быстрого просмотра выкройки */}
      <PatternModal
        pattern={selectedPattern}
        onClose={() => setSelectedPattern(null)}
      />
    </div>
  );
};

export default Catalog;
