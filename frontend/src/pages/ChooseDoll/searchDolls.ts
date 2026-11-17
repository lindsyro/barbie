import { type DollItem } from "./dollsData.ts";

/**
 * Проверяет, соответствует ли кукла поисковой строке.
 * Поиск осуществляется без учета регистра по имени, категории и росту.
 */
export function matchesDollSearch(doll: DollItem, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return true;
  }
  const inNameEn = doll.nameEn.toLowerCase().includes(trimmed);
  const inNameRu = doll.nameRu.toLowerCase().includes(trimmed);
  const inCategory = doll.category.toLowerCase().includes(trimmed);
  const inHeight = String(doll.height).includes(trimmed);
  return inNameEn || inNameRu || inCategory || inHeight;
}

/**
 * Фильтрует массив кукол по поисковому запросу.
 */
export function searchDolls(dolls: DollItem[], query: string): DollItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return dolls;
  }
  return dolls.filter((doll) => matchesDollSearch(doll, trimmed));
}
