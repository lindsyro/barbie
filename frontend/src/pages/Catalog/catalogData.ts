export interface CatalogPatternItem {
  id: number;
  title: string;
  doll: string;
  scale: "1/6" | "1/4" | "kids";
  category: "girls-1-6" | "girls-1-4" | "guys" | "kids";
  subcategory: string;
  price: number;
  priceFormatted: string;
  image: string;
  images: string[];
  tag: string;
  format: string;
  difficulty: "Легкий" | "Средний" | "Продвинутый";
  description: string;
  fabricRecommended?: string;
}

export type CatalogPatternItemInput = Omit<CatalogPatternItem, "image" | "images"> & {
  image?: string;
  images?: string[];
};

export interface CatalogCategoryMeta {
  id: "all" | "girls-1-6" | "girls-1-4" | "guys" | "kids";
  label: string;
  title: string;
  subtitle: string;
  breadcrumb: string;
  subcategories: { id: string; label: string }[];
}

const BASE = import.meta.env.BASE_URL;

/* ==========================================================================
   Автоматическое обнаружение фото из папок frontend/public/patterns/<id>/
   Vite автоматически отслеживает добавление новых файлов в эти папки.
   ========================================================================== */

const patternGlobs = import.meta.glob(
  "../../../public/patterns/*/*.{png,jpg,jpeg,webp,PNG,JPG}",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const patternImagesById: Record<number, string[]> = {};

for (const rawPath in patternGlobs) {
  // rawPath выглядит как "../../../public/patterns/1/01_cover.png"
  const match = rawPath.match(/patterns\/(\d+)\/([^/]+)$/);
  if (match) {
    const folderId = parseInt(match[1], 10);
    const fileName = match[2];
    const url = `${BASE}patterns/${folderId}/${encodeURI(fileName.normalize("NFC"))}`;

    if (!patternImagesById[folderId]) {
      patternImagesById[folderId] = [];
    }
    patternImagesById[folderId].push(url);
  }
}

// Сортировка: обложка (cover, обложка, 01_) всегда идёт первой, остальные по алфавиту
function sortPatternImages(a: string, b: string): number {
  const nameA = decodeURI(a.split("/").pop() || "").toLowerCase();
  const nameB = decodeURI(b.split("/").pop() || "").toLowerCase();

  const isCoverA = nameA.includes("cover") || nameA.includes("обложк") || nameA.startsWith("01");
  const isCoverB = nameB.includes("cover") || nameB.includes("обложк") || nameB.startsWith("01");

  if (isCoverA && !isCoverB) return -1;
  if (!isCoverA && isCoverB) return 1;

  return nameA.localeCompare(nameB, "ru", { numeric: true });
}

for (const id in patternImagesById) {
  patternImagesById[id].sort(sortPatternImages);
}

/**
 * Получить список всех фото выкройки по её ID папки.
 * Если вы добавляете новое фото в папку frontend/public/patterns/<id>/,
 * оно автоматически появится на сайте без изменения кода.
 */
export function getPatternImages(id: number): string[] {
  return patternImagesById[id] || [];
}

export const CATALOG_CATEGORIES: CatalogCategoryMeta[] = [
  {
    id: "all",
    label: "Все выкройки",
    title: "Каталог выкроек",
    subtitle: "Авторские PDF-лекала GOOSE Fashion House",
    breadcrumb: "Все выкройки",
    subcategories: [],
  },
  {
    id: "girls-1-6",
    label: "Девушки 1/6",
    title: "Выкройки для девушек 1/6",
    subtitle: "Барби Standard, Curvy, Tall, Mizi, Momoko, Poppy Parker, Блайз",
    breadcrumb: "Для девушек 1/6",
    subcategories: [
      { id: "all", label: "Все 1/6" },
      { id: "barbie-standard", label: "Барби Стандарт" },
      { id: "barbie-curvy", label: "Барби Пышка (Curvy)" },
      { id: "barbie-tall", label: "Барби Высокая (Tall)" },
      { id: "barbie-90s", label: "Барби 90-х" },
      { id: "mizi", label: "Mizi Doll" },
      { id: "momoko", label: "Momoko" },
      { id: "poppy-parker", label: "Poppy Parker / FR6" },
      { id: "blythe", label: "Блайз (Blythe)" },
      { id: "rainbow-high", label: "Rainbow High" },
    ],
  },
  {
    id: "girls-1-4",
    label: "Девушки 1/4",
    title: "Выкройки для девушек 1/4",
    subtitle: "Коллекции для шарнирных кукол BJD и MiniFee",
    breadcrumb: "Для девушек 1/4",
    subcategories: [
      { id: "all", label: "Все 1/4" },
      { id: "minifee", label: "MiniFee (Fairyland)" },
      { id: "bjd-msd", label: "BJD MSD 40-42 см" },
    ],
  },
  {
    id: "guys",
    label: "Парни / Кен",
    title: "Выкройки для парней",
    subtitle: "Мужская кукольная мода: Кен, Adonis 2.0, FR Homme",
    breadcrumb: "Для парней",
    subcategories: [
      { id: "all", label: "Все парни" },
      { id: "ken-standard", label: "Кен Стандарт" },
      { id: "ken-broad", label: "Кен Мускулистый (Broad)" },
      { id: "adonis-2-0", label: "Adonis 2.0" },
      { id: "fr-homme", label: "FR Homme" },
    ],
  },
  {
    id: "kids",
    label: "Миниатюрные / Дети",
    title: "Выкройки для миниатюрных кукол",
    subtitle: "Келли, Chelsea (Челси), Lati Yellow, Obitsu 11",
    breadcrumb: "Для детей и миниатюр",
    subcategories: [
      { id: "all", label: "Все миниатюры" },
      { id: "chelsea", label: "Келли / Челси (14 см)" },
      { id: "lati-yellow", label: "Lati Yellow" },
      { id: "obitsu-11", label: "Obitsu 11" },
    ],
  },
];

const RAW_PATTERNS: CatalogPatternItemInput[] = [
  {
    "id": 1,
    "title": "Платье с корсетом",
    "doll": "Mizi Katie Girl / Barbie Standard MTM / Poppy Parker / Integrity FR6 / Nu Face",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "mizi",
    "price": 690,
    "priceFormatted": "690 ₽",
    "tag": "Платья",
    "format": "PDF + видеоинструкция",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Платье с корсетом. Для кукол Mizi Katie Girl (Мизи Кэти Гёрл). Также подходит для Barbie Standard MTM, FR6, Nu Face и Poppy Parker. PDF-выкройка и подробная пошаговая инструкция по пошиву.",
    "fabricRecommended": "Хлопок, шелк, подкладочная ткань, люверсы/шнуровка для корсета"
  },
  {
    "id": 2,
    "title": "Водолазка-боди с вырезом",
    "doll": "Integrity NU.Face / Integrity FR6",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "fashion-royalty",
    "price": 450,
    "priceFormatted": "450 ₽",
    "tag": "Топы и боди",
    "format": "PDF",
    "difficulty": "Легкий",
    "description": "Электронная выкройка: Водолазка-боди с вырезом для кукол Integrity NU.Face (Интегрити Ню Фейс) и Integrity FR6 (Интегрити ФР6).",
    "fabricRecommended": "Эластичный трикотаж, кулирная гладь с лайкрой"
  },
  {
    "id": 3,
    "title": "Нижнее белье для Integrity FR6",
    "doll": "Integrity FR6",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "lingerie",
    "price": 490,
    "priceFormatted": "490 ₽",
    "tag": "Белье",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Нижнее белье (бюстгальтер и трусики) для куклы Integrity FR6.",
    "fabricRecommended": "Эластичное кружево, бельевая сетка, эластичная тесьма"
  },
  {
    "id": 4,
    "title": "Летнее платье с запахом и рюшами",
    "doll": "Barbie Made to Move (Стандарт)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "barbie",
    "price": 550,
    "priceFormatted": "550 ₽",
    "tag": "Платья",
    "format": "PDF",
    "difficulty": "Легкий",
    "description": "Электронная выкройка: Летнее платье с запахом и рюшами для куклы Barbie Made to Move Стандарт.",
    "fabricRecommended": "Легкий хлопок, батист, вискоза, штапель"
  },
  {
    "id": 5,
    "title": "Юбка в складку",
    "doll": "Integrity FR6 / Integrity NU.Face",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "skirts",
    "price": 390,
    "priceFormatted": "390 ₽",
    "tag": "Юбки",
    "format": "PDF",
    "difficulty": "Легкий",
    "description": "Электронная выкройка: Юбка в складку для кукол Integrity FR6 (Интегрити ФР6) и Integrity NU.Face (Интегрити Ню Фейс).",
    "fabricRecommended": "Тонкая костюмная ткань, шерсть, хлопок"
  },
  {
    "id": 6,
    "title": "Нижнее белье для Rainbow High",
    "doll": "Rainbow High",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "other",
    "price": 450,
    "priceFormatted": "450 ₽",
    "tag": "Белье",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Нижнее белье (бюстгальтер и трусики) для куклы Rainbow High.",
    "fabricRecommended": "Эластичная сетка, кружево, трикотаж"
  },
  {
    "id": 7,
    "title": "Образ для Barbie Kelly: комбинезон, гольфики, футболка-боди",
    "doll": "Barbie Kelly (Барби Келли)",
    "scale": "kids",
    "category": "kids",
    "subcategory": "kelly",
    "price": 490,
    "priceFormatted": "490 ₽",
    "tag": "Комплекты",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Образ для куклы Barbie Kelly (Барби Келли) — комбинезон, гольфики, футболка-боди.",
    "fabricRecommended": "Хлопковый трикотаж, тонкий деним, батист"
  },
  {
    "id": 8,
    "title": "Парка для Integrity FR6 и NU.Face",
    "doll": "Integrity Toys FR 6.0 / Integrity Toys Nu Face",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "outerwear",
    "price": 850,
    "priceFormatted": "850 ₽",
    "tag": "Верхняя одежда",
    "format": "PDF",
    "difficulty": "Продвинутый",
    "description": "Электронная выкройка: Парка для кукол Integrity FR6 (Интегрити ФР6 / Integrity Toys FR 6.0) и Integrity NU.Face (Интегрити Ню Фейс / Integrity Toys Nu Face).",
    "fabricRecommended": "Курточная ткань, плащевка, хлопковый твил, подкладочная ткань"
  },
  {
    "id": 9,
    "title": "Парка для Integrity FR Homme",
    "doll": "Integrity FR Homme",
    "scale": "1/6",
    "category": "guys",
    "subcategory": "outerwear",
    "price": 850,
    "priceFormatted": "850 ₽",
    "tag": "Верхняя одежда",
    "format": "PDF",
    "difficulty": "Продвинутый",
    "description": "Электронная выкройка: Мужская парка для куклы Integrity FR Homme.",
    "fabricRecommended": "Плащевая ткань, мембрана, тонкий канвас, подкладка"
  },
  {
    "id": 10,
    "title": "Платье № 2 для Poppy Parker",
    "doll": "Poppy Parker (Поппи Паркер)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "poppy-parker",
    "price": 550,
    "priceFormatted": "550 ₽",
    "tag": "Платья",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Платье № 2 для куклы Poppy Parker (Поппи Паркер).",
    "fabricRecommended": "Хлопок, шелк, атлас, трикотаж"
  },
  {
    "id": 11,
    "title": "Платье «Сияние»",
    "doll": "Integrity FR6 (Интегрити ФР6)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "fashion-royalty",
    "price": 590,
    "priceFormatted": "590 ₽",
    "tag": "Платья",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Платье «Сияние» для куклы Integrity FR6 (Интегрити ФР6).",
    "fabricRecommended": "Ткань с пайетками, люрекс, эластичный бархат"
  },
  {
    "id": 12,
    "title": "Футболка «Эксклюзив»",
    "doll": "Integrity / Barbie / Mizi / Poppy Parker и подобных",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "basic",
    "price": 350,
    "priceFormatted": "350 ₽",
    "tag": "Базовый гардероб",
    "format": "PDF",
    "difficulty": "Легкий",
    "description": "Электронная выкройка: Футболка «Эксклюзив» для кукол Integrity, Barbie, Mizi, Poppy Parker и подобных кукол.",
    "fabricRecommended": "Хлопковый трикотаж кулирка с лайкрой"
  },
  {
    "id": 13,
    "title": "Блузка «Афелия»",
    "doll": "Integrity FR6 / Integrity NU.Face",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "fashion-royalty",
    "price": 490,
    "priceFormatted": "490 ₽",
    "tag": "Блузки",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Блузка «Афелия» для кукол Integrity FR6 и Integrity NU.Face.",
    "fabricRecommended": "Шелк, шифон, крепдешин, батист"
  },
  {
    "id": 14,
    "title": "Брюки клёш для Мизи Кети Герл",
    "doll": "Mizi Katie Girl (Мизи Кети Герл)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "mizi",
    "price": 450,
    "priceFormatted": "450 ₽",
    "tag": "Брюки",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Брюки клёш для куклы Мизи Кети Герл (Mizi Katie Girl).",
    "fabricRecommended": "Костюмная ткань, деним, плотный трикотаж"
  },
  {
    "id": 15,
    "title": "Брюки клёш для PetWORKs Momoko",
    "doll": "PetWORKs Momoko (Момоко)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "momoko",
    "price": 450,
    "priceFormatted": "450 ₽",
    "tag": "Брюки",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Брюки клёш для куклы PetWORKs Momoko (Момоко).",
    "fabricRecommended": "Тонкий деним, костюмная ткань, хлопок"
  },
  {
    "id": 16,
    "title": "Брюки клёш для Барби пышки МТМ",
    "doll": "Barbie Made to Move Curvy (Барби пышка МТМ)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "barbie",
    "price": 450,
    "priceFormatted": "450 ₽",
    "tag": "Брюки",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Брюки клёш для куклы Barbie Made to Move Curvy (Барби пышка МТМ).",
    "fabricRecommended": "Деним с эластаном, плотный трикотаж, костюмная ткань"
  },
  {
    "id": 17,
    "title": "Брюки для высокой Барби МТМ",
    "doll": "Barbie Made to Move Tall (Барби высокая MTM)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "barbie",
    "price": 450,
    "priceFormatted": "450 ₽",
    "tag": "Брюки",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Брюки для куклы Barbie Made to Move Tall (Барби высокая МТМ).",
    "fabricRecommended": "Костюмная ткань, деним, хлопок со стрейчем"
  },
  {
    "id": 18,
    "title": "Футболка-боди для PetWORKs Momoko",
    "doll": "PetWORKs Momoko (Момоко)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "momoko",
    "price": 390,
    "priceFormatted": "390 ₽",
    "tag": "Топы и боди",
    "format": "PDF",
    "difficulty": "Легкий",
    "description": "Электронная выкройка: Футболка-боди для куклы PetWORKs Momoko (Момоко).",
    "fabricRecommended": "Тонкий трикотаж кулирка, вискоза с эластаном"
  },
  {
    "id": 19,
    "title": "Боди-бюстье «Афродита»",
    "doll": "Barbie Made to Move Curvy (Барби МТМ пышка)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "barbie",
    "price": 590,
    "priceFormatted": "590 ₽",
    "tag": "Боди",
    "format": "PDF + видеоурок",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Боди-бюстье «Афродита» для Барби МТМ пышки (Barbie Made to Move Curvy). Сложность 3 из 5. Выкройка в формате PDF с бесплатным видеоуроком по пошиву.",
    "fabricRecommended": "Эластичная сетка, кружево, бифлекс"
  },
  {
    "id": 20,
    "title": "Боди-бюстье «Миранда»",
    "doll": "Барби / Поппи Паркер",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "barbie",
    "price": 590,
    "priceFormatted": "590 ₽",
    "tag": "Боди",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Боди-бюстье «Миранда».",
    "fabricRecommended": "Кружево, корсетная сетка, эластичный атлас"
  },
  {
    "id": 21,
    "title": "Кофточка и брюки клёш для MiniFee",
    "doll": "MiniFee (Минифи)",
    "scale": "1/4",
    "category": "girls-1-4",
    "subcategory": "bjd",
    "price": 790,
    "priceFormatted": "790 ₽",
    "tag": "Костюмы",
    "format": "Бумажная выкройка",
    "difficulty": "Средний",
    "description": "Бумажная выкройка: Кофточка и брюки клёш для куклы MiniFee.",
    "fabricRecommended": "Трикотаж лапша, футер 2-нитка, джерси"
  },
  {
    "id": 22,
    "title": "Водолазка-боди для Ken",
    "doll": "Ken (качок, Made to Move) / Ken MTM Standard",
    "scale": "1/6",
    "category": "guys",
    "subcategory": "ken",
    "price": 450,
    "priceFormatted": "450 ₽",
    "tag": "Базовый гардероб",
    "format": "PDF + видеоурок",
    "difficulty": "Легкий",
    "description": "Электронная выкройка: Водолазка-боди для куклы Ken (качок, Made to Move) и Ken MTM Standard. Сложность 2 из 5. Выкройка в формате PDF с кратким описанием пошива и бесплатным видеоуроком.",
    "fabricRecommended": "Высокоэластичный трикотаж кулирная гладь с лайкрой"
  },
  {
    "id": 23,
    "title": "Рубашка для Ken",
    "doll": "Ken (Кен)",
    "scale": "1/6",
    "category": "guys",
    "subcategory": "ken",
    "price": 490,
    "priceFormatted": "490 ₽",
    "tag": "Рубашки",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Рубашка для куклы Ken (Кен).",
    "fabricRecommended": "Сорочечный хлопок, поплин, батист"
  },
  {
    "id": 24,
    "title": "Водолазка-боди для Adonis 2.0",
    "doll": "Adonis 2.0",
    "scale": "1/6",
    "category": "guys",
    "subcategory": "other",
    "price": 490,
    "priceFormatted": "490 ₽",
    "tag": "Базовый гардероб",
    "format": "PDF + видеоурок",
    "difficulty": "Легкий",
    "description": "Электронная выкройка: Водолазка-боди для куклы Adonis 2.0. Сложность 2 из 5. Выкройка в формате PDF с бесплатным видеоуроком по пошиву.",
    "fabricRecommended": "Эластичный трикотаж масло, микромодал, вискоза"
  },
  {
    "id": 25,
    "title": "Водолазка-боди для Blythe",
    "doll": "Blythe (Блайз)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "blythe",
    "price": 450,
    "priceFormatted": "450 ₽",
    "tag": "Топы и боди",
    "format": "PDF + видеоурок",
    "difficulty": "Легкий",
    "description": "Электронная выкройка: Водолазка-боди для куклы Blythe. Сложность 2 из 5. Выкройка в формате PDF с кратким описанием пошива и бесплатным видеоуроком на RUTUBE.",
    "fabricRecommended": "Тонкий хлопковый трикотаж, микрофибра"
  },
  {
    "id": 26,
    "title": "Жилетка для кукол GOOSE",
    "doll": "Poppy Parker / Integrity / Barbie / Mizi",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "outerwear",
    "price": 650,
    "priceFormatted": "650 ₽",
    "tag": "Верхняя одежда",
    "format": "Бумажная выкройка",
    "difficulty": "Средний",
    "description": "Бумажная выкройка: Жилетка для кукол Poppy Parker, Integrity, Barbie, Mizi.",
    "fabricRecommended": "Стеганая плащевка, тонкий утеплитель, курточная ткань"
  },
  {
    "id": 27,
    "title": "Водолазка-боди для Барби стандарт",
    "doll": "Barbie Standard (Барби стандарт)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "barbie",
    "price": 450,
    "priceFormatted": "450 ₽",
    "tag": "Топы и боди",
    "format": "PDF + видеоурок",
    "difficulty": "Легкий",
    "description": "Электронная выкройка: Водолазка-боди для Барби стандарт (Barbie Standard). Выкройка в формате PDF с бесплатным видеоуроком по пошиву.",
    "fabricRecommended": "Хлопковый трикотаж с эластаном, кулирка"
  },
  {
    "id": 28,
    "title": "Водолазка-боди для Барби 90-х",
    "doll": "Barbie 90s (Барби 90-х)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "barbie",
    "price": 450,
    "priceFormatted": "450 ₽",
    "tag": "Топы и боди",
    "format": "PDF + видеоурок",
    "difficulty": "Легкий",
    "description": "Электронная выкройка: Водолазка-боди для Барби 90-х (Barbie 90s). Выкройка в формате PDF с бесплатным видеоуроком по пошиву.",
    "fabricRecommended": "Трикотаж эластичный, рибана, кулирка"
  },
  {
    "id": 29,
    "title": "Водолазка-боди для хлопковой ткани для Barbie",
    "doll": "Barbie made to move (Барби стандарт МТМ)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "barbie",
    "price": 450,
    "priceFormatted": "450 ₽",
    "tag": "Топы и боди",
    "format": "PDF",
    "difficulty": "Легкий",
    "description": "Электронная выкройка: Водолазка-боди для хлопковой ткани для куклы Barbie Made to Move (Барби стандарт МТМ).",
    "fabricRecommended": "100% хлопковый трикотаж (кулирка)"
  },
  {
    "id": 30,
    "title": "Водолазка-боди для Integrity FR6 и Nu Face",
    "doll": "Integrity Toys FR 6.0 / Integrity Toys Nu Face",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "fashion-royalty",
    "price": 450,
    "priceFormatted": "450 ₽",
    "tag": "Топы и боди",
    "format": "PDF + видеоурок",
    "difficulty": "Легкий",
    "description": "Электронная выкройка: Водолазка-боди для кукол Интегрити ФР6 (Integrity Toys FR 6.0) и Интегрити Ню Фейс (Integrity Toys Nu Face). PDF-выкройка и бесплатный видеоурок по пошиву на RUTUBE.",
    "fabricRecommended": "Эластичный трикотаж, сетка"
  },
  {
    "id": 31,
    "title": "Водолазка-боди для высокой Барби",
    "doll": "Barbie Made to Move Tall (Барби высокая)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "barbie",
    "price": 450,
    "priceFormatted": "450 ₽",
    "tag": "Топы и боди",
    "format": "PDF + видеоурок",
    "difficulty": "Легкий",
    "description": "Электронная выкройка: Водолазка-боди для высокой Барби (Barbie Made to Move Tall). PDF-выкройка и бесплатный видеоурок по пошиву на RUTUBE.",
    "fabricRecommended": "Трикотаж эластичный, микрофибра"
  },
  {
    "id": 32,
    "title": "Боди-бюстье «Миранда» для Poppy Parker",
    "doll": "Poppy Parker (Поппи Паркер)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "poppy-parker",
    "price": 590,
    "priceFormatted": "590 ₽",
    "tag": "Боди",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Боди-бюстье «Миранда» для куклы Poppy Parker (Поппи Паркер).",
    "fabricRecommended": "Кружево с фестонами, корсетная эластичная сетка"
  },
  {
    "id": 33,
    "title": "Нижнее белье для двух кукол Barbie MTM (высокая и стандарт)",
    "doll": "Barbie Made to Move Tall & Barbie Made to Move Standard",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "barbie",
    "price": 490,
    "priceFormatted": "490 ₽",
    "tag": "Белье",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Нижнее белье (бюстгальтер и трусики) для стрейчевой ткани. Подходит обеим куклам: Barbie Made to Move Tall (Барби высокая МТМ) и Barbie Made to Move (Барби стандарт МТМ).",
    "fabricRecommended": "Стрейчевая ткань, микрофибра, бельевая сетка"
  },
  {
    "id": 34,
    "title": "Платье «Аргентина»",
    "doll": "Integrity FR6 (Интегрити ФР6)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "fashion-royalty",
    "price": 650,
    "priceFormatted": "650 ₽",
    "tag": "Платья",
    "format": "PDF + видеоурок",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Платье «Аргентина» для куклы Integrity FR6 (Интегрити ФР6). Сложность 3,5 из 5. Выкройка в формате PDF с кратким описанием пошива и бесплатным видеоуроком.",
    "fabricRecommended": "Плотный шелк, атлас, тафта"
  },
  {
    "id": 35,
    "title": "Нижнее белье для Blythe",
    "doll": "Blythe (Блайз)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "blythe",
    "price": 490,
    "priceFormatted": "490 ₽",
    "tag": "Белье",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Нижнее белье (бюстгальтер и трусики) для стрейчевой ткани для куклы Blythe (Блайз).",
    "fabricRecommended": "Стрейчевое кружево, тонкий батист, эластичная сетка"
  },
  {
    "id": 36,
    "title": "Колготки и чулки для Blythe",
    "doll": "Blythe (Блайз)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "blythe",
    "price": 390,
    "priceFormatted": "390 ₽",
    "tag": "Аксессуары",
    "format": "PDF",
    "difficulty": "Легкий",
    "description": "Электронная выкройка: Колготки и чулки для куклы Blythe (Блайз).",
    "fabricRecommended": "Эластичный капрон 20-40 den, эластичная сетка"
  },
  {
    "id": 37,
    "title": "Нижнее белье для Barbie Curvy (пышка)",
    "doll": "Barbie Made to Move Curvy (Барби пышка МТМ)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "barbie",
    "price": 490,
    "priceFormatted": "490 ₽",
    "tag": "Белье",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Нижнее белье (бюстгальтер и трусики) для стрейчевой ткани для куклы Barbie Made to Move Curvy (Барби пышка МТМ).",
    "fabricRecommended": "Стрейчевая ткань, бельевая сетка, эластичное кружево"
  },
  {
    "id": 38,
    "title": "Нижнее белье для Barbie Petit (петит)",
    "doll": "Barbie Made to Move Petit (Барби петит МТМ)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "barbie",
    "price": 490,
    "priceFormatted": "490 ₽",
    "tag": "Белье",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Нижнее белье (бюстгальтер и трусики) для стрейчевой ткани для куклы Barbie Made to Move Petit (Барби петит МТМ).",
    "fabricRecommended": "Стрейчевая ткань, бельевая сетка, эластичное кружево"
  },
  {
    "id": 39,
    "title": "Летнее платье с запахом для Integrity Nu Face",
    "doll": "Integrity Toys Nu Face (Интегрити Ню Фейс)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "fashion-royalty",
    "price": 550,
    "priceFormatted": "550 ₽",
    "tag": "Платья",
    "format": "PDF + видеоурок",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Летнее платье с запахом для куклы Integrity Toys Nu Face (Интегрити Ню Фейс). Сложность 3 из 5. Выкройка в формате PDF с бесплатным видеоуроком по пошиву.",
    "fabricRecommended": "Легкий хлопок, штапель, вискоза, шелк"
  },
  {
    "id": 40,
    "title": "Платье «Колокольчик» для Barbie Kelly",
    "doll": "Barbie Kelly (Барби Келли)",
    "scale": "kids",
    "category": "kids",
    "subcategory": "kelly",
    "price": 450,
    "priceFormatted": "450 ₽",
    "tag": "Платья",
    "format": "PDF",
    "difficulty": "Легкий",
    "description": "Электронная выкройка: Платье «Колокольчик» для куклы Barbie Kelly (Барби Келли).",
    "fabricRecommended": "Хлопок, батист, лен, поплин"
  },
  {
    "id": 41,
    "title": "Платье «Рыбка» для Барби пышки МТМ",
    "doll": "Barbie made to move curvy (Барби пышка МТМ)",
    "scale": "1/6",
    "category": "girls-1-6",
    "subcategory": "barbie",
    "price": 590,
    "priceFormatted": "590 ₽",
    "tag": "Платья",
    "format": "PDF",
    "difficulty": "Средний",
    "description": "Электронная выкройка: Платье «Рыбка» для куклы Barbie Made to Move Curvy (Барби пышка МТМ).",
    "fabricRecommended": "Эластичный бархат, трикотаж с люрексом, шелк со стрейчем"
  }
];

/* ==========================================================================
   Итоговый массив выкроек для каталога:
   Фотографии автоматически считываются из папки с соответствующим id номером.
   Вам больше никогда не нужно прописывать пути к фотографиям вручную!
   ========================================================================== */

export const CATALOG_PATTERNS: CatalogPatternItem[] = RAW_PATTERNS
  .filter((item) => {
    // Отображаем товары, в папках которых есть фотографии (или задано ручное фото)
    const images = getPatternImages(item.id);
    return images.length > 0 || !!item.image;
  })
  .map((item) => {
    const autoImages = getPatternImages(item.id);
    const mainImage = item.image || autoImages[0] || `${BASE}patterns/27/1.png`;
    const allImages = autoImages.length > 0 ? autoImages : (item.images || [mainImage]);

    return {
      ...item,
      image: mainImage,
      images: allImages,
    };
  });
