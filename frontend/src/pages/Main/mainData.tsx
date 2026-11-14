import { CATALOG_PATTERNS } from "../Catalog/catalogData.ts";
import type { PatternItem, AdvantageItem, QuickCategoryItem } from "./types.ts";

/**
 * Подборка популярных выкроек на главной странице — формируется напрямую из CATALOG_PATTERNS.
 * ID соответствуют реальным позициям каталога:
 *  - 27: Водолазка-боди для Барби стандарт
 *  - 19: Боди-бюстье «Афродита» (Барби пышка МТМ)
 *  - 1:  Платье с корсетом (Mizi Katie Girl / Barbie Standard MTM)
 *  - 22: Водолазка-боди для Ken
 *  - 8:  Парка для Integrity FR6 и NU.Face
 *  - 21: Кофточка и брюки клёш для MiniFee
 *  - 34: Платье «Аргентина» (Integrity FR6)
 *  - 25: Водолазка-боди для Blythe
 */
export const POPULAR_PATTERN_IDS = [27, 19, 1, 22, 8, 21, 34, 25];

export const FEATURED_PATTERNS: PatternItem[] = POPULAR_PATTERN_IDS
  .map((id) => CATALOG_PATTERNS.find((item) => item.id === id))
  .filter((item): item is NonNullable<typeof item> => Boolean(item))
  .map((item) => ({
    id: item.id,
    title: item.title,
    tag: item.tag,
    doll: item.doll,
    price: item.priceFormatted,
    image: item.image,
  }));

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

export const CATEGORIES_QUICK: QuickCategoryItem[] = [
  {
    name: "Все выкройки",
    id: "all",
    count: String(CATALOG_PATTERNS.length),
  },
  {
    name: "Девушки 1/6",
    id: "girls-1-6",
    count: String(CATALOG_PATTERNS.filter((p) => p.category === "girls-1-6").length),
  },
  {
    name: "Мужчины (Ken / Adonis)",
    id: "guys",
    count: String(CATALOG_PATTERNS.filter((p) => p.category === "guys").length),
  },
  {
    name: "Девушки 1/4 (MiniFee)",
    id: "girls-1-4",
    count: String(CATALOG_PATTERNS.filter((p) => p.category === "girls-1-4").length),
  },
  {
    name: "Дети и мини (Kelly)",
    id: "kids",
    count: String(CATALOG_PATTERNS.filter((p) => p.category === "kids").length),
  },
];
