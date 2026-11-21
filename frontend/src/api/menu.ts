/**
 * API-клиент для работы со структурой меню из базы данных
 */
import type { MenuItem } from "../components/Menu/types.ts";

export interface DbMenuItem {
  id: number;
  title: string;
  url: string;
  order: number;
  target: string;
  isVisible: boolean;
  isDynamic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuResponse {
  total: number;
  items: DbMenuItem[];
}

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "");

/**
 * Загружает активные пункты меню из базы данных через Express API (/api/menu)
 * @param all Если true, возвращает все пункты, включая скрытые (для админ-панели)
 */
export async function fetchMenuItems(all: boolean = false): Promise<MenuItem[]> {
  try {
    const url = all ? `${API_BASE}/api/menu?all=true` : `${API_BASE}/api/menu`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Ошибка загрузки меню: ${res.status}`);
    }
    const data: MenuResponse = await res.json();
    if (!Array.isArray(data.items)) {
      return [];
    }

    return data.items.map((item) => ({
      id: String(item.id),
      label: item.title,
      href: item.url,
      target: item.target,
      isDynamic: item.isDynamic,
    }));
  } catch (err) {
    console.error("Не удалось получить пункты меню из базы данных:", err);
    return [];
  }
}

/**
 * Загружает исходные записи меню из базы данных (с полями order, isVisible, isDynamic) для админ-панели
 */
export async function fetchRawMenuItems(all: boolean = true): Promise<DbMenuItem[]> {
  try {
    const url = all ? `${API_BASE}/api/menu?all=true` : `${API_BASE}/api/menu`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Ошибка загрузки меню: ${res.status}`);
    }
    const data: MenuResponse = await res.json();
    return Array.isArray(data.items) ? data.items : [];
  } catch (err) {
    console.error("Не удалось получить пункты меню:", err);
    return [];
  }
}

/**
 * Создает новый пункт меню (для админ-панели)
 */
export async function createMenuItem(data: Partial<DbMenuItem>): Promise<DbMenuItem> {
  const res = await fetch(`${API_BASE}/api/menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Ошибка создания пункта меню: ${res.status}`);
  }
  return res.json();
}

/**
 * Обновляет существующий пункт меню (для админ-панели)
 */
export async function updateMenuItem(id: number, data: Partial<DbMenuItem>): Promise<DbMenuItem> {
  const res = await fetch(`${API_BASE}/api/menu/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Ошибка обновления пункта меню: ${res.status}`);
  }
  return res.json();
}

/**
 * Удаляет пункт меню по ID (для админ-панели)
 */
export async function deleteMenuItem(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/menu/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Ошибка удаления пункта меню: ${res.status}`);
  }
  return res.json();
}

/**
 * Сохраняет новый порядок пунктов меню (для админ-панели)
 */
export async function reorderMenuItems(items: { id: number; order: number }[]): Promise<DbMenuItem[]> {
  const res = await fetch(`${API_BASE}/api/menu/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    throw new Error(`Ошибка изменения порядка меню: ${res.status}`);
  }
  const data: MenuResponse = await res.json();
  return data.items;
}
