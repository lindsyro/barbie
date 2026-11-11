import crypto from "node:crypto";

/**
 * Хранилище данных в памяти (In-Memory Database).
 * При необходимости легко заменяется на PostgreSQL / MongoDB / SQLite.
 */

// Пароль для демо-пользователя: password123
const demoSalt = crypto.randomBytes(16).toString("hex");
const demoPasswordHash = crypto.scryptSync("password123", demoSalt, 64).toString("hex");

export const users = [
  {
    id: "user-demo-1",
    email: "demo@goose.ru",
    name: "Ирина",
    passwordHash: demoPasswordHash,
    salt: demoSalt,
    createdAt: new Date("2026-01-15T10:00:00Z").toISOString(),
  },
];

// Хранилище активных токенов авторизации: token -> userId
export const sessions = new Map();
// Добавляем демо-токен для быстрого тестирования
sessions.set("demo-token-12345", "user-demo-1");

export const categories = [
  { id: "all", name: "Все выкройки", count: 48, scale: "all" },
  { id: "barbie-std", name: "Барби Standard", count: 18, scale: "1/6" },
  { id: "barbie-curvy", name: "Барби Curvy (Пышка)", count: 12, scale: "1/6" },
  { id: "ken", name: "Кен (Ken)", count: 8, scale: "1/6" },
  { id: "minifee", name: "MiniFee (BJD)", count: 6, scale: "1/4" },
  { id: "blythe", name: "Блайз (Blythe)", count: 4, scale: "1/6" },
  { id: "kids", name: "Куклы-дети (Chelsea, Lati)", count: 5, scale: "kids" },
];

export const patterns = [
  {
    id: 1,
    title: "Водолазка-боди для Барби",
    doll: "Барби / Made to Move",
    scale: "1/6",
    category: "barbie-std",
    price: 490,
    tag: "Хит продаж",
    rating: 4.9,
    reviewsCount: 38,
    image: "/1.png",
    description: "Базовое облегающее боди с длинным рукавом и воротником-стойкой для кукол Barbie Made to Move и со стандартным типом тела. Включает детальные выкройки в формате PDF (А4) и пошаговый видеоурок.",
    difficulty: "Легкий",
    format: "PDF (A4 + инструкции)",
    isFeatured: true,
  },
  {
    id: 2,
    title: "Боди-бюстье «Афродита»",
    doll: "Барби Standard & Curvy",
    scale: "1/6",
    category: "barbie-curvy",
    price: 550,
    tag: "Новинка",
    rating: 5.0,
    reviewsCount: 19,
    image: "/2.png",
    description: "Изящное вечернее боди с рельефными швами и чашечками. Подходит для классических и пышных тел Барби (Curvy).",
    difficulty: "Средний",
    format: "PDF (A4 + инструкции)",
    isFeatured: true,
  },
  {
    id: 3,
    title: "Выкройка MiniFee: кофточка и брюки клёш",
    doll: "MiniFee (40-42 см)",
    scale: "1/4",
    category: "minifee",
    price: 690,
    tag: "BJD",
    rating: 4.8,
    reviewsCount: 14,
    image: "/3.png",
    description: "Стильный трикотажный комплект для шарнирных кукол BJD 1/4 (линейка Fairyland MiniFee Moe/Active line). Точная посадка по фигуре.",
    difficulty: "Средний",
    format: "PDF (A4 + инструкции)",
    isFeatured: true,
  },
  {
    id: 4,
    title: "Элегантная водолазка-боди для Кена",
    doll: "Ken Fashionistas / BMR1959",
    scale: "1/6",
    category: "ken",
    price: 490,
    tag: "Мужская коллекция",
    rating: 4.9,
    reviewsCount: 22,
    image: "/4.png",
    description: "Мужская водолазка из эластичного трикотажа для кукол Ken со стандартным и мускулистым телом Broad.",
    difficulty: "Легкий",
    format: "PDF (A4 + инструкции)",
    isFeatured: true,
  },
  {
    id: 5,
    title: "Тренч оверсайз для Блайз",
    doll: "Блайз (Blythe)",
    scale: "1/6",
    category: "blythe",
    price: 620,
    tag: "Тренды",
    rating: 4.9,
    reviewsCount: 17,
    image: "/5.png",
    description: "Двубортный тренчкот с поясом, эполетами и подкладкой для кукол Blythe (на родном или шарнирном теле TBL).",
    difficulty: "Продвинутый",
    format: "PDF (A4 + инструкции)",
    isFeatured: false,
  },
  {
    id: 6,
    title: "Платье с оборками для Челси",
    doll: "Челси (Chelsea)",
    scale: "kids",
    category: "kids",
    price: 390,
    tag: "Малыши",
    rating: 5.0,
    reviewsCount: 9,
    image: "/6.png",
    description: "Нежное воздушное платье для кукол-сестричек Челси (14 см) с удобной застёжкой на микро-липучку.",
    difficulty: "Легкий",
    format: "PDF (A4 + инструкции)",
    isFeatured: false,
  },
];

export const reviews = [
  {
    id: 1,
    author: "Елена Смирнова",
    doll: "Барби Made to Move",
    patternTitle: "Водолазка-боди для Барби",
    rating: 5,
    text: "Выкройка идеальная! Села на Йогу как влитая, никаких лишних складок. Контрольный квадрат на А4 совпал с первого раза.",
    createdAt: "2026-02-18",
  },
  {
    id: 2,
    author: "Анастасия",
    doll: "MiniFee Chloe",
    patternTitle: "Выкройка MiniFee: кофточка и брюки клёш",
    rating: 5,
    text: "Найти хорошую выкройку на Минифи сложно, но этот комплект превзошел все ожидания! Спасибо за видео-пояснения.",
    createdAt: "2026-03-01",
  },
  {
    id: 3,
    author: "Мария К.",
    doll: "Ken BMR1959",
    patternTitle: "Элегантная водолазка-боди для Кена",
    rating: 5,
    text: "Кен теперь одет стильно! Шьётся за полчаса, очень подробное описание.",
    createdAt: "2026-03-12",
  },
];

// Хранилище корзин: userId -> [{ patternId, addedAt }]
// Поскольку выкройки являются цифровыми товарами, количество не хранится (каждая позиция уникальна)
export const carts = new Map();
// Предзаполненная корзина для демо-пользователя (2 уникальные выкройки)
carts.set("user-demo-1", [
  { patternId: 1, addedAt: new Date().toISOString() },
  { patternId: 2, addedAt: new Date().toISOString() },
]);

// Хранилище избранного: userId -> Set([patternId])
export const wishlists = new Map();
// Предзаполненное избранное для демо-пользователя
wishlists.set("user-demo-1", new Set([1, 3, 4]));

// Хранилище заказов: []
export const orders = [];

// Хранилище подписчиков на рассылку
export const subscribers = new Set(["demo@goose.ru"]);
