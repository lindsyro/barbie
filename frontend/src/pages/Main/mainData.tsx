import type { PatternItem, AdvantageItem, QuickCategoryItem } from "./types.ts";

const BASE = import.meta.env.BASE_URL;

export const FEATURED_PATTERNS: PatternItem[] = [
  {
    id: 1,
    title: "Водолазка-боди для Барби",
    tag: "Хит продаж",
    doll: "Барби / Made to Move",
    price: "490 ₽",
    image: `${BASE}1.png`,
  },
  {
    id: 2,
    title: "Боди-бюстье «Афродита»",
    tag: "Новинка",
    doll: "Барби Standard & Curvy",
    price: "550 ₽",
    image: `${BASE}2.png`,
  },
  {
    id: 3,
    title: "Выкройка MiniFee: кофточка и брюки клёш",
    tag: "BJD",
    doll: "MiniFee (40-42 см)",
    price: "690 ₽",
    image: `${BASE}3.png`,
  },
  {
    id: 4,
    title: "Элегантная водолазка-боди для Кена",
    tag: "Мужская коллекция",
    doll: "Ken Fashionistas / BMR1959",
    price: "490 ₽",
    image: `${BASE}4.png`,
  },
];

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
  { name: "Все выкройки", id: "all", count: "48" },
  { name: "Барби Standard", id: "barbie-std", count: "18" },
  { name: "Барби Curvy (Пышка)", id: "barbie-curvy", count: "12" },
  { name: "Кен (Ken)", id: "ken", count: "8" },
  { name: "MiniFee (BJD)", id: "minifee", count: "6" },
  { name: "Блайз (Blythe)", id: "blythe", count: "4" },
];
