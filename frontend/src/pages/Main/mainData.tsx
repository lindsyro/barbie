import type { CatalogPatternItem } from "../Catalog/types.ts";
import type { PatternItem, AdvantageItem, QuickCategoryItem } from "./types.ts";

export const POPULAR_PATTERN_IDS = [27, 19, 1, 22, 8, 21, 34, 25];

export function mapPatternsToFeatured(patterns: CatalogPatternItem[]): PatternItem[] {
  return POPULAR_PATTERN_IDS.map((id) => patterns.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      id: item.id,
      title: item.title,
      tag: "Выкройка",
      doll: item.doll,
      price: `${item.price} ₽`,
      image: item.image,
    }));
}

export const FEATURED_PATTERNS: PatternItem[] = [];

export const ADVANTAGES: AdvantageItem[] = [
  {
    id: "instant",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Мгновенная доставка",
    description: "PDF-выкройка и инструкции приходят на email сразу после оплаты",
  },
  {
    id: "fit",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Идеальная посадка",
    description: "Лекала отработаны с микронной точностью на оригинальных куклах",
  },
  {
    id: "video",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="M10 9l6 3-6 3V9z" fill="currentColor" stroke="none" />
      </svg>
    ),
    title: "Видео-инструкции",
    description: "К каждой выкройке прилагается подробный видеоурок по сборке и пошиву",
  },
  {
    id: "print",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <path d="M6 14h12v8H6z" />
      </svg>
    ),
    title: "Удобный формат А4",
    description: "Печать на любом домашнем принтере с контрольным квадратом 100%",
  },
];

export function getQuickCategories(patterns: CatalogPatternItem[]): QuickCategoryItem[] {
  return [
    {
      name: "Все выкройки",
      id: "all",
      count: String(patterns.length),
    },
    {
      name: "Девушки 1/6",
      id: "girls-1-6",
      count: String(
        patterns.filter(
          (p) =>
            p.category === "girls-1-6" ||
            p.dolls?.some(
              (d) =>
                (d as unknown as { category?: { slug: string } })?.category?.slug === "girls-1-6"
            )
        ).length
      ),
    },
    {
      name: "Мужчины (Ken / Adonis)",
      id: "guys",
      count: String(
        patterns.filter(
          (p) =>
            p.category === "guys" ||
            p.dolls?.some(
              (d) => (d as unknown as { category?: { slug: string } })?.category?.slug === "guys"
            )
        ).length
      ),
    },
    {
      name: "Девушки 1/4 (MiniFee)",
      id: "girls-1-4",
      count: String(
        patterns.filter(
          (p) =>
            p.category === "girls-1-4" ||
            p.dolls?.some(
              (d) =>
                (d as unknown as { category?: { slug: string } })?.category?.slug === "girls-1-4"
            )
        ).length
      ),
    },
    {
      name: "Дети и мини (Kelly)",
      id: "kids",
      count: String(
        patterns.filter(
          (p) =>
            p.category === "kids" ||
            p.dolls?.some(
              (d) => (d as unknown as { category?: { slug: string } })?.category?.slug === "kids"
            )
        ).length
      ),
    },
  ];
}

export const CATEGORIES_QUICK: QuickCategoryItem[] = [
  { name: "Все выкройки", id: "all", count: "41" },
  { name: "Девушки 1/6", id: "girls-1-6", count: "34" },
  { name: "Мужчины (Ken / Adonis)", id: "guys", count: "4" },
  { name: "Девушки 1/4 (MiniFee)", id: "girls-1-4", count: "1" },
  { name: "Дети и мини (Kelly)", id: "kids", count: "2" },
];
