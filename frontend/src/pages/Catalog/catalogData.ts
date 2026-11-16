export interface CatalogPatternItem {
  id: number;
  title: string;
  doll: string;
  category: "girls-1-6" | "girls-1-4" | "guys" | "kids";
  price: number;
  image: string;
  images: string[];
}

export type CatalogPatternItemInput = Omit<CatalogPatternItem, "image" | "images"> & {
  image?: string;
  images?: string[];
};

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

const RAW_PATTERNS: CatalogPatternItemInput[] = [
  {
    id: 1,
    title: "Платье с корсетом",
    doll: "Mizi Katie Girl / Barbie Standard MTM / Poppy Parker / Integrity FR6 / Nu Face",
    category: "girls-1-6",
    price: 690,
  },
  {
    id: 2,
    title: "Водолазка-боди с вырезом",
    doll: "Integrity NU.Face / Integrity FR6",
    category: "girls-1-6",
    price: 450,
  },
  {
    id: 3,
    title: "Нижнее белье для Integrity FR6",
    doll: "Integrity FR6",
    category: "girls-1-6",
    price: 490,
  },
  {
    id: 4,
    title: "Летнее платье с запахом и рюшами",
    doll: "Barbie Made to Move (Стандарт)",
    category: "girls-1-6",
    price: 550,
  },
  {
    id: 5,
    title: "Юбка в складку",
    doll: "Integrity FR6 / Integrity NU.Face",
    category: "girls-1-6",
    price: 390,
  },
  {
    id: 6,
    title: "Нижнее белье для Rainbow High",
    doll: "Rainbow High",
    category: "girls-1-6",
    price: 450,
  },
  {
    id: 7,
    title: "Образ для Barbie Kelly: комбинезон, гольфики, футболка-боди",
    doll: "Barbie Kelly (Барби Келли)",
    category: "kids",
    price: 490,
  },
  {
    id: 8,
    title: "Парка для Integrity FR6 и NU.Face",
    doll: "Integrity Toys FR 6.0 / Integrity Toys Nu Face",
    category: "girls-1-6",
    price: 850,
  },
  {
    id: 9,
    title: "Парка для Integrity FR Homme",
    doll: "Integrity FR Homme",
    category: "guys",
    price: 850,
  },
  {
    id: 10,
    title: "Платье № 2 для Poppy Parker",
    doll: "Poppy Parker (Поппи Паркер)",
    category: "girls-1-6",
    price: 550,
  },
  {
    id: 11,
    title: "Платье «Сияние»",
    doll: "Integrity FR6 (Интегрити ФР6)",
    category: "girls-1-6",
    price: 590,
  },
  {
    id: 12,
    title: "Футболка «Эксклюзив»",
    doll: "Integrity / Barbie / Mizi / Poppy Parker и подобных",
    category: "girls-1-6",
    price: 350,
  },
  {
    id: 13,
    title: "Блузка «Афелия»",
    doll: "Integrity FR6 / Integrity NU.Face",
    category: "girls-1-6",
    price: 490,
  },
  {
    id: 14,
    title: "Брюки клёш для Мизи Кети Герл",
    doll: "Mizi Katie Girl (Мизи Кети Герл)",
    category: "girls-1-6",
    price: 450,
  },
  {
    id: 15,
    title: "Брюки клёш для PetWORKs Momoko",
    doll: "PetWORKs Momoko (Момоко)",
    category: "girls-1-6",
    price: 450,
  },
  {
    id: 16,
    title: "Брюки клёш для Барби пышки МТМ",
    doll: "Barbie Made to Move Curvy (Барби пышка МТМ)",
    category: "girls-1-6",
    price: 450,
  },
  {
    id: 17,
    title: "Брюки для высокой Барби МТМ",
    doll: "Barbie Made to Move Tall (Барби высокая MTM)",
    category: "girls-1-6",
    price: 450,
  },
  {
    id: 18,
    title: "Футболка-боди для PetWORKs Momoko",
    doll: "PetWORKs Momoko (Момоко)",
    category: "girls-1-6",
    price: 390,
  },
  {
    id: 19,
    title: "Боди-бюстье «Афродита»",
    doll: "Barbie Made to Move Curvy (Барби МТМ пышка)",
    category: "girls-1-6",
    price: 590,
  },
  {
    id: 20,
    title: "Боди-бюстье «Миранда»",
    doll: "Барби / Поппи Паркер",
    category: "girls-1-6",
    price: 590,
  },
  {
    id: 21,
    title: "Кофточка и брюки клёш для MiniFee",
    doll: "MiniFee (Минифи)",
    category: "girls-1-4",
    price: 790,
  },
  {
    id: 22,
    title: "Водолазка-боди для Ken",
    doll: "Ken (качок, Made to Move) / Ken MTM Standard",
    category: "guys",
    price: 450,
  },
  {
    id: 23,
    title: "Рубашка для Ken",
    doll: "Ken (Кен)",
    category: "guys",
    price: 490,
  },
  {
    id: 24,
    title: "Водолазка-боди для Adonis 2.0",
    doll: "Adonis 2.0",
    category: "guys",
    price: 490,
  },
  {
    id: 25,
    title: "Водолазка-боди для Blythe",
    doll: "Blythe (Блайз)",
    category: "girls-1-6",
    price: 450,
  },
  {
    id: 26,
    title: "Жилетка для кукол GOOSE",
    doll: "Poppy Parker / Integrity / Barbie / Mizi",
    category: "girls-1-6",
    price: 650,
  },
  {
    id: 27,
    title: "Водолазка-боди для Барби стандарт",
    doll: "Barbie Standard (Барби стандарт)",
    category: "girls-1-6",
    price: 450,
  },
  {
    id: 28,
    title: "Водолазка-боди для Барби 90-х",
    doll: "Barbie 90s (Барби 90-х)",
    category: "girls-1-6",
    price: 450,
  },
  {
    id: 29,
    title: "Водолазка-боди для хлопковой ткани для Barbie",
    doll: "Barbie made to move (Барби стандарт МТМ)",
    category: "girls-1-6",
    price: 450,
  },
  {
    id: 30,
    title: "Водолазка-боди для Integrity FR6 и Nu Face",
    doll: "Integrity Toys FR 6.0 / Integrity Toys Nu Face",
    category: "girls-1-6",
    price: 450,
  },
  {
    id: 31,
    title: "Водолазка-боди для высокой Барби",
    doll: "Barbie Made to Move Tall (Барби высокая)",
    category: "girls-1-6",
    price: 450,
  },
  {
    id: 32,
    title: "Боди-бюстье «Миранда» для Poppy Parker",
    doll: "Poppy Parker (Поппи Паркер)",
    category: "girls-1-6",
    price: 590,
  },
  {
    id: 33,
    title: "Нижнее белье для двух кукол Barbie MTM (высокая и стандарт)",
    doll: "Barbie Made to Move Tall & Barbie Made to Move Standard",
    category: "girls-1-6",
    price: 490,
  },
  {
    id: 34,
    title: "Платье «Аргентина»",
    doll: "Integrity FR6 (Интегрити ФР6)",
    category: "girls-1-6",
    price: 650,
  },
  {
    id: 35,
    title: "Нижнее белье для Blythe",
    doll: "Blythe (Блайз)",
    category: "girls-1-6",
    price: 490,
  },
  {
    id: 36,
    title: "Колготки и чулки для Blythe",
    doll: "Blythe (Блайз)",
    category: "girls-1-6",
    price: 390,
  },
  {
    id: 37,
    title: "Нижнее белье для Barbie Curvy (пышка)",
    doll: "Barbie Made to Move Curvy (Барби пышка МТМ)",
    category: "girls-1-6",
    price: 490,
  },
  {
    id: 38,
    title: "Нижнее белье для Barbie Petit (петит)",
    doll: "Barbie Made to Move Petit (Барби петит МТМ)",
    category: "girls-1-6",
    price: 490,
  },
  {
    id: 39,
    title: "Летнее платье с запахом для Integrity Nu Face",
    doll: "Integrity Toys Nu Face (Интегрити Ню Фейс)",
    category: "girls-1-6",
    price: 550,
  },
  {
    id: 40,
    title: "Платье «Колокольчик» для Barbie Kelly",
    doll: "Barbie Kelly (Барби Келли)",
    category: "kids",
    price: 450,
  },
  {
    id: 41,
    title: "Платье «Рыбка» для Барби пышки МТМ",
    doll: "Barbie made to move curvy (Барби пышка МТМ)",
    category: "girls-1-6",
    price: 590,
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
