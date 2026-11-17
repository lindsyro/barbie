/**
 * API-клиент для получения списка кукол из базы данных PostgreSQL
 */

import { type DollItem, type DollCategory } from "../pages/ChooseDoll/types.ts";

export interface DollsResponse {
  total: number;
  items: DollItem[];
}

export interface DollCategoriesResponse {
  total: number;
  items: DollCategory[];
}

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "");

/**
 * Загружает список кукол из PostgreSQL через Express API (/api/dolls)
 */
export async function fetchDolls(): Promise<DollItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/dolls`);
    if (!res.ok) {
      throw new Error(`Ошибка загрузки кукол: ${res.status}`);
    }
    const data: DollsResponse = await res.json();
    return Array.isArray(data.items) ? data.items : [];
  } catch (err) {
    console.error("Не удалось получить кукол из базы данных:", err);
    return [];
  }
}

/**
 * Загружает данные одной куклы по ID из базы данных
 */
export async function fetchDollById(id: number): Promise<DollItem | null> {
  try {
    const res = await fetch(`${API_BASE}/api/dolls/${id}`);
    if (!res.ok) {
      return null;
    }
    const doll: DollItem = await res.json();
    return doll;
  } catch (err) {
    console.error(`Не удалось загрузить куклу #${id} из базы данных:`, err);
    return null;
  }
}

/**
 * Загружает категории кукол со списком привязанных к ним кукол из базы данных (для меню)
 */
export async function fetchDollCategories(): Promise<DollCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/api/dolls/categories`);
    if (!res.ok) {
      throw new Error(`Ошибка загрузки категорий кукол: ${res.status}`);
    }
    const data: DollCategoriesResponse = await res.json();
    return Array.isArray(data.items) ? data.items : [];
  } catch (err) {
    console.error("Не удалось получить категории кукол из базы данных:", err);
    return [];
  }
}
