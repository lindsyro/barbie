import type { MenuItem } from "./types.ts";

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: "main", label: "Главная", href: "#" },
  {
    id: "catalog",
    label: "Каталог выкроек",
    href: "#catalog",
    children: [
      {
        id: "girls-1-6",
        label: "Для девушек 1/6",
        href: "#barbie",
        children: [
          {
            id: "barbie-standard",
            label: "Барби Стандарт",
            href: "#barbie-standard",
            description: "Сюда можно красивое такое описание",
          },
          {
            id: "barbie-curvy",
            label: "Барби Пышка",
            href: "#barbie-curvy",
            description: "Сюда можно красивое такое описание",
          },
          {
            id: "barbie-petite",
            label: "Барби Петит",
            href: "#barbie-petite",
            description: "Комплекты, брюки клёш, жилетки и жакеты",
          },
          {
            id: "barbie-tall",
            label: "Барби Высокая",
            href: "#barbie-tall",
          },
          {
            id: "barbie-90s",
            label: "Барби 90-х",
            href: "#barbie-90s",
          },
          {
            id: "poppy-parker",
            label: "Интергрити фр6",
            href: "#poppy-parker",
          },
          {
            id: "blythe",
            label: "Интегрити фейс",
            href: "#blythe",
            description: "Комплекты, брюки клёш, жилетки и жакеты",
          },
        ],
      },
      {
        id: "girls-1-4",
        label: "Для девушек 1/4",
        href: "#barbie2",
        children: [
          {
            id: "girls-1",
            label: "первый",
            href: "#girls-1",
            description: "Комплекты, брюки клёш, жилетки и жакеты",
          },
          {
            id: "girls-2",
            label: "второй",
            href: "#girls-2",
            description: "Сюда можно красивое такое описание",
          },
          {
            id: "girls-3",
            label: "третий",
            href: "#girls-2",
            description: "Сюда можно красивое такое описание",
          },
        ],
      },
      {
        id: "guys",
        label: "Для парней",
        href: "#ken",
        children: [
          {
            id: "ken-standard",
            label: "1",
            href: "#ken-standard",
          },
          {
            id: "ken-broad",
            label: "2",
            href: "#ken-broad",
          },
          {
            id: "adonis-2-0",
            label: "3",
            href: "#adonis-2-0",
          },
          {
            id: "it-homme",
            label: "4",
            href: "#it-homme",
          },
          {
            id: "minifee-boy",
            label: "5",
            href: "#minifee-boy",
          },
          {
            id: "guys-outerwear",
            label: "6",
            href: "#guys-outerwear",
          },
        ],
      },
      {
        id: "kids",
        label: "Для детей",
        href: "#children",
        children: [
          {
            id: "chelsea",
            label: "пункт меню",
            href: "#chelsea",
            description: "Одежда",
          },
          {
            id: "lati-yellow",
            label: "пункт меню",
            href: "#lati-yellow",
            description: "Одежда",
          },
          {
            id: "middie-obitsu",
            label: "пункт меню",
            href: "#middie-obitsu",
            description: "Одежда",
          },
        ],
      },
    ],
  },
  {
    id: "tutorials",
    label: "Видеокурсы",
    href: "#tutorials",
    badge: "Free",
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
