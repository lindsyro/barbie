const BASE = import.meta.env.BASE_URL;

/* ==========================================================================
   Автоматическое обнаружение фото из папок frontend/public/patterns/<id>/
   Vite автоматически отслеживает добавление новых файлов в эти папки.
   ========================================================================== */

const patternGlobs = import.meta.glob(
  "../../public/patterns/*/*.{png,jpg,jpeg,webp,PNG,JPG}",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const patternImagesById: Record<number, string[]> = {};

for (const rawPath in patternGlobs) {
  // rawPath выглядит как "../../public/patterns/1/01_cover.png"
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

  const isCoverA =
    nameA.includes("cover") || nameA.includes("обложк") || nameA.startsWith("01");
  const isCoverB =
    nameB.includes("cover") || nameB.includes("обложк") || nameB.startsWith("01");

  if (isCoverA && !isCoverB) return -1;
  if (!isCoverA && isCoverB) return 1;

  return nameA.localeCompare(nameB, "ru", { numeric: true });
}

for (const id in patternImagesById) {
  patternImagesById[id].sort(sortPatternImages);
}

/**
 * Получить список всех фото выкройки по её ID папки.
 */
export function getPatternImages(id: number): string[] {
  return patternImagesById[id] || [];
}
