/**
 * Утилиты поиска и фильтрации выкроек
 */

export interface SearchablePatternItem {
  title?: string;
  doll?: string;
  dolls?: Array<{
    nameRu?: string;
    nameEn?: string;
  }>;
}

/**
 * Проверяет, соответствует ли выкройка поисковому запросу.
 * Поиск осуществляется без учета регистра по:
 * - Названию выкройки (title)
 * - Имени подходящей куклы (doll)
 * - Списку связанных кукол (dolls: nameRu, nameEn)
 */
export function matchesPatternSearch(
  pattern: SearchablePatternItem,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }

  const matchTitle = Boolean(pattern.title?.toLowerCase().includes(q));
  const matchDoll =
    typeof pattern.doll === "string" && pattern.doll.toLowerCase().includes(q);
  const matchDolls = Array.isArray(pattern.dolls)
    ? pattern.dolls.some((d) =>
        Boolean((d.nameRu || d.nameEn || "").toLowerCase().includes(q)),
      )
    : false;

  return matchTitle || matchDoll || matchDolls;
}

/**
 * Фильтрует массив выкроек по поисковому запросу.
 * Если запрос пустой, возвращает исходный массив без изменений.
 */
export function searchPatterns<T extends SearchablePatternItem>(
  patterns: T[],
  query: string,
): T[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return patterns;
  }
  return patterns.filter((pattern) => matchesPatternSearch(pattern, trimmed));
}
