import type { DollItem } from "../ChooseDoll/types.ts";

export interface CatalogPatternItem {
  id: number;
  title: string;
  doll: string;
  category: "girls-1-6" | "girls-1-4" | "guys" | "kids";
  price: number;
  image: string;
  images: string[];
  dolls?: DollItem[];
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

/**
 * Кеш выкроек каталога в памяти для синхронного доступа (обновляется при fetchPatterns)
 */
export let CATALOG_PATTERNS: CatalogPatternItem[] = [];

export function setCatalogPatterns(patterns: CatalogPatternItem[]): void {
  CATALOG_PATTERNS = patterns;
}
