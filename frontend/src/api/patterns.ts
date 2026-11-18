/**
 * API-клиент для работы с выкройками из базы данных PostgreSQL
 */

import type { DollItem } from "../pages/ChooseDoll/types.ts";
import type { CatalogPatternItem } from "../pages/Catalog/types.ts";
import { getPatternImages } from "@/utils/patternImages.ts";

export interface PatternItem {
  id: number;
  title: string;
  price: number;
  dolls?: DollItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PatternsResponse {
  total: number;
  items: PatternItem[];
}

const BASE = import.meta.env.BASE_URL;

/**
 * Форматирует список подходящих кукол для карточки выкройки
 */
export function formatPatternDolls(dolls?: DollItem[]): string {
  if (!dolls || dolls.length === 0) return "Подходит для кукол";
  return dolls.map((d) => d.nameRu || d.nameEn).join(" / ");
}

/**
 * Маппит данные выкройки из базы данных в формат для каталога
 */
export function mapDbPatternToCatalogItem(item: {
  id: number;
  title: string;
  price: number;
  dolls?: DollItem[];
}): CatalogPatternItem {
  const autoImages = getPatternImages(item.id);
  const mainImage = autoImages[0] || `${BASE}patterns/27/1.png`;
  const allImages = autoImages.length > 0 ? autoImages : [mainImage];
  const dollNames = formatPatternDolls(item.dolls);
  const catSlug =
    ((item.dolls?.[0] as unknown as { category?: { slug: string } })?.category?.slug as CatalogPatternItem["category"]) ||
    "girls-1-6";

  return {
    id: item.id,
    title: item.title,
    doll: dollNames,
    category: catSlug,
    price: item.price,
    image: mainImage,
    images: allImages,
    dolls: item.dolls,
  };
}

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "");

let cachedPatterns: CatalogPatternItem[] = [];

/**
 * Получить закешированные выкройки
 */
export function getCachedPatterns(): CatalogPatternItem[] {
  return cachedPatterns;
}

/**
 * Найти выкройку в локальном кеше по ID
 */
export function findCachedPatternById(id: number): CatalogPatternItem | undefined {
  return cachedPatterns.find((p) => p.id === id);
}

/**
 * Найти выкройку в локальном кеше по точному названию
 */
export function findCachedPatternByTitle(title: string): CatalogPatternItem | undefined {
  return cachedPatterns.find((p) => p.title === title);
}

/**
 * Загружает список выкроек из PostgreSQL с поддержкой фильтров
 */
export async function fetchPatterns(params?: {
  category?: string;
  dollId?: number;
  search?: string;
}): Promise<CatalogPatternItem[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "all") {
      query.set("category", params.category);
    }
    if (params?.dollId) {
      query.set("dollId", String(params.dollId));
    }
    if (params?.search && params.search.trim()) {
      query.set("search", params.search.trim());
    }

    const queryString = query.toString();
    const url = `${API_BASE}/api/patterns${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Ошибка загрузки выкроек: ${res.status}`);
    }
    const data: PatternsResponse = await res.json();
    const rawItems = Array.isArray(data.items) ? data.items : [];
    const mapped = rawItems.map(mapDbPatternToCatalogItem);

    // Если запрос без фильтров — обновляем локальный кеш каталога
    if (!params || (!params.category && !params.dollId && !params.search)) {
      cachedPatterns = mapped;
    }

    return mapped;
  } catch (err) {
    console.error("Не удалось получить выкройки из базы данных:", err);
    return cachedPatterns;
  }
}

/**
 * Загружает популярные/рекомендуемые выкройки
 */
export async function fetchFeaturedPatterns(): Promise<CatalogPatternItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/patterns/featured`);
    if (!res.ok) {
      throw new Error(`Ошибка загрузки рекомендуемых выкроек: ${res.status}`);
    }
    const data: PatternsResponse = await res.json();
    const rawItems = Array.isArray(data.items) ? data.items : [];
    return rawItems.map(mapDbPatternToCatalogItem);
  } catch (err) {
    console.error("Не удалось получить рекомендуемые выкройки:", err);
    return [];
  }
}

/**
 * Загружает выкройку по её ID со списком подходящих кукол
 */
export async function fetchPatternById(id: number): Promise<CatalogPatternItem | null> {
  try {
    const res = await fetch(`${API_BASE}/api/patterns/${id}`);
    if (!res.ok) {
      return null;
    }
    const item: PatternItem = await res.json();
    return mapDbPatternToCatalogItem(item);
  } catch (err) {
    console.error(`Не удалось загрузить выкройку #${id}:`, err);
    return null;
  }
}
