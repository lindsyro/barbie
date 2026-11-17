import type { MenuItem } from "./types.ts";

export const getItemId = (item: MenuItem): string =>
  item.id || item.href || item.label;

export const isItemActive = (item: MenuItem, targetHref?: string): boolean => {
  if (!targetHref) return false;
  const cleanTarget = targetHref.replace("#", "").trim();
  if (!cleanTarget || cleanTarget === "main") return false;

  const cleanItemHref = (item.href || "").replace("#", "").trim();
  const itemId = item.id || "";

  // Прямое совпадение по href или id
  if (cleanItemHref && cleanItemHref === cleanTarget) return true;
  if (itemId && itemId === cleanTarget) return true;

  // Рекурсивная проверка дочерних пунктов (категорий и кукол)
  if (item.children && item.children.length > 0) {
    return item.children.some((child) => isItemActive(child, targetHref));
  }

  return false;
};
