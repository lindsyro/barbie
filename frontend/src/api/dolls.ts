/**
 * API-клиент для получения списка кукол из базы данных PostgreSQL
 */

import { DOLLS_DATA, type DollItem } from "../pages/ChooseDoll/dollsData.ts";

export interface DollsResponse {
  total: number;
  items: DollItem[];
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
    console.warn("Не удалось получить кукол из базы данных, fallback на локальные данные:", err);
    return DOLLS_DATA;
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
    console.warn(`Не удалось загрузить куклу #${id} из базы данных:`, err);
    return DOLLS_DATA.find((d) => d.id === id) || null;
  }
}
