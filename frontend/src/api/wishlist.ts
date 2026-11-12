/**
 * API взаимодействия с избранным (Wishlist) в PostgreSQL для конкретного пользователя
 * + Поддержка гостевого избранного в localStorage и слияния при авторизации
 */

import { getStoredToken, getStoredUser } from "./auth.ts";

export interface WishlistPattern {
  id: number;
  title: string;
  doll: string;
  scale?: string;
  categoryId?: string | null;
  price: number;
  tag: string;
  rating?: number;
  reviewsCount?: number;
  image: string;
  description?: string;
  difficulty?: string;
  format?: string;
  isFeatured?: boolean;
}

export interface WishlistResponse {
  total: number;
  items: WishlistPattern[];
}

export interface ToggleWishlistResponse {
  inWishlist: boolean;
  message: string;
  wishlist: WishlistResponse;
}

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "");

const BASE = import.meta.env.BASE_URL;
const GUEST_WISHLIST_KEY = "goose_guest_wishlist";

function isStaticHosting(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.endsWith("github.io") || window.location.protocol === "file:";
}

// Начальные данные для демо-пользователя в офлайн/статическом режиме
const DEMO_FALLBACK_PATTERNS: WishlistPattern[] = [
  {
    id: 1,
    title: "Водолазка-боди для Барби",
    doll: "Барби / Made to Move",
    scale: "1/6",
    price: 490,
    tag: "Хит продаж",
    image: `${BASE}1.png`,
    description: "Базовое облегающее боди с длинным рукавом и воротником-стойкой для кукол Barbie.",
  },
  {
    id: 3,
    title: "Выкройка MiniFee: кофточка и брюки клёш",
    doll: "MiniFee (40-42 см)",
    scale: "1/4",
    price: 690,
    tag: "BJD",
    image: `${BASE}3.png`,
    description: "Стильный трикотажный комплект для шарнирных кукол BJD 1/4.",
  },
  {
    id: 4,
    title: "Элегантная водолазка-боди для Кена",
    doll: "Ken Fashionistas / BMR1959",
    scale: "1/6",
    price: 490,
    tag: "Мужская коллекция",
    image: `${BASE}4.png`,
    description: "Мужская водолазка из эластичного трикотажа для кукол Ken.",
  },
];

function getUserStorageKey(userId: string): string {
  return `goose_wishlist_${userId}`;
}

function getFallbackWishlist(userId?: string): WishlistResponse {
  if (!userId) {
    const guestItems = getGuestWishlist();
    return { total: guestItems.length, items: guestItems };
  }

  try {
    const raw = localStorage.getItem(getUserStorageKey(userId));
    if (raw) {
      const items: WishlistPattern[] = JSON.parse(raw);
      return { total: items.length, items };
    }
    const user = getStoredUser();
    if (user?.email === "demo@goose.ru") {
      setFallbackWishlist(DEMO_FALLBACK_PATTERNS, userId);
      return { total: DEMO_FALLBACK_PATTERNS.length, items: DEMO_FALLBACK_PATTERNS };
    }
  } catch {
    // ignore
  }
  return { total: 0, items: [] };
}

function setFallbackWishlist(items: WishlistPattern[], userId: string): void {
  try {
    localStorage.setItem(getUserStorageKey(userId), JSON.stringify(items));
  } catch {
    // ignore
  }
}

/**
 * Нормализация пути к изображению
 */
export function normalizePatternImage(img: string): string {
  if (!img) return `${BASE}1.png`;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/")) {
    return `${BASE}${img.slice(1)}`;
  }
  return `${BASE}${img}`;
}

/* ==========================================================================
   Управление гостевым избранным в localStorage
   ========================================================================== */

/**
 * Получить список избранного неавторизованного пользователя из localStorage
 */
export function getGuestWishlist(): WishlistPattern[] {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (!raw) return [];
    const items: WishlistPattern[] = JSON.parse(raw);
    return Array.isArray(items)
      ? items.map((it) => ({ ...it, image: normalizePatternImage(it.image) }))
      : [];
  } catch {
    return [];
  }
}

/**
 * Сохранить список избранного неавторизованного пользователя в localStorage
 */
export function setGuestWishlist(items: WishlistPattern[]): void {
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

/**
 * Очистить гостевое избранное из localStorage
 */
export function clearGuestWishlist(): void {
  try {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  } catch {
    // ignore
  }
}

/**
 * Переключить выкройку в гостевом избранном (добавить / удалить)
 */
export function toggleGuestWishlist(pattern: WishlistPattern): {
  inWishlist: boolean;
  items: WishlistPattern[];
} {
  const current = getGuestWishlist();
  const exists = current.some((it) => it.id === pattern.id);
  let updated: WishlistPattern[];

  if (exists) {
    updated = current.filter((it) => it.id !== pattern.id);
  } else {
    const normalized: WishlistPattern = {
      ...pattern,
      image: normalizePatternImage(pattern.image),
    };
    updated = [normalized, ...current];
  }

  setGuestWishlist(updated);
  return {
    inWishlist: !exists,
    items: updated,
  };
}

/**
 * Удалить выкройку из гостевого избранного
 */
export function removeFromGuestWishlist(patternId: number): WishlistPattern[] {
  const current = getGuestWishlist();
  const updated = current.filter((it) => it.id !== patternId);
  setGuestWishlist(updated);
  return updated;
}

/* ==========================================================================
   Синхронизация и слияние избранного
   ========================================================================== */

/**
 * Синхронизировать (объединить) гостевое избранное с базой данных пользователя
 */
export async function syncGuestWishlistWithDatabase(
  guestItems: WishlistPattern[]
): Promise<WishlistResponse> {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    return { total: guestItems.length, items: guestItems };
  }

  if (guestItems.length === 0) {
    return fetchWishlist();
  }

  const patternIds = guestItems.map((it) => it.id);

  if (isStaticHosting() && !import.meta.env.VITE_API_URL) {
    // В статической среде объединяем в локальном хранилище пользователя
    const current = getFallbackWishlist(user.id);
    const existingIds = new Set(current.items.map((it) => it.id));
    const merged = [...current.items];

    for (const g of guestItems) {
      if (!existingIds.has(g.id)) {
        merged.push(g);
        existingIds.add(g.id);
      }
    }

    setFallbackWishlist(merged, user.id);
    clearGuestWishlist();
    return { total: merged.length, items: merged };
  }

  try {
    const response = await fetch(`${API_BASE}/api/wishlist/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ patternIds }),
    });

    if (response.status === 405 || !response.ok) {
      // Fallback
      const current = getFallbackWishlist(user.id);
      const existingIds = new Set(current.items.map((it) => it.id));
      const merged = [...current.items];

      for (const g of guestItems) {
        if (!existingIds.has(g.id)) {
          merged.push(g);
          existingIds.add(g.id);
        }
      }

      setFallbackWishlist(merged, user.id);
      clearGuestWishlist();
      return { total: merged.length, items: merged };
    }

    const data: { wishlist: WishlistResponse } = await response.json();
    clearGuestWishlist();

    return {
      total: data.wishlist.total,
      items: data.wishlist.items.map((it) => ({
        ...it,
        image: normalizePatternImage(it.image),
      })),
    };
  } catch {
    const current = getFallbackWishlist(user.id);
    const existingIds = new Set(current.items.map((it) => it.id));
    const merged = [...current.items];

    for (const g of guestItems) {
      if (!existingIds.has(g.id)) {
        merged.push(g);
        existingIds.add(g.id);
      }
    }

    setFallbackWishlist(merged, user.id);
    clearGuestWishlist();
    return { total: merged.length, items: merged };
  }
}

/* ==========================================================================
   Основные методы для авторизованных пользователей
   ========================================================================== */

/**
 * Получить список избранного текущего пользователя из БД PostgreSQL
 */
export async function fetchWishlist(): Promise<WishlistResponse> {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    const guestItems = getGuestWishlist();
    return { total: guestItems.length, items: guestItems };
  }

  if (isStaticHosting() && !import.meta.env.VITE_API_URL) {
    return getFallbackWishlist(user.id);
  }

  try {
    const response = await fetch(`${API_BASE}/api/wishlist`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 405) {
      return getFallbackWishlist(user.id);
    }

    if (!response.ok) {
      if (response.status === 401) {
        return { total: 0, items: [] };
      }
      return getFallbackWishlist(user.id);
    }

    const data: WishlistResponse = await response.json();
    return {
      total: data.total ?? data.items?.length ?? 0,
      items: (data.items || []).map((it) => ({
        ...it,
        image: normalizePatternImage(it.image),
      })),
    };
  } catch {
    return getFallbackWishlist(user.id);
  }
}

/**
 * Переключить состояние выкройки в избранном (добавить / удалить) в PostgreSQL
 */
export async function toggleWishlist(
  patternId: number,
  patternFallback?: Partial<WishlistPattern>
): Promise<ToggleWishlistResponse> {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    throw new Error("Требуется авторизация");
  }

  if (isStaticHosting() && !import.meta.env.VITE_API_URL) {
    return toggleWishlistFallback(patternId, user.id, patternFallback);
  }

  try {
    const response = await fetch(`${API_BASE}/api/wishlist/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ patternId }),
    });

    if (response.status === 405) {
      return toggleWishlistFallback(patternId, user.id, patternFallback);
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || "Ошибка при обновлении избранного");
    }

    const data: ToggleWishlistResponse = await response.json();
    return {
      inWishlist: data.inWishlist,
      message: data.message,
      wishlist: {
        total: data.wishlist.total,
        items: data.wishlist.items.map((it) => ({
          ...it,
          image: normalizePatternImage(it.image),
        })),
      },
    };
  } catch (err) {
    if (isStaticHosting()) {
      return toggleWishlistFallback(patternId, user.id, patternFallback);
    }
    throw err;
  }
}

function toggleWishlistFallback(
  patternId: number,
  userId: string,
  patternFallback?: Partial<WishlistPattern>
): ToggleWishlistResponse {
  const current = getFallbackWishlist(userId);
  const exists = current.items.some((it) => it.id === patternId);
  const updated = exists
    ? current.items.filter((it) => it.id !== patternId)
    : [
        {
          id: patternId,
          title: patternFallback?.title || `Выкройка #${patternId}`,
          doll: patternFallback?.doll || "Барби",
          price: patternFallback?.price || 490,
          tag: patternFallback?.tag || "Выкройка",
          image: patternFallback?.image || `${BASE}1.png`,
          format: "PDF (A4 + инструкции)",
        },
        ...current.items,
      ];

  setFallbackWishlist(updated, userId);
  return {
    inWishlist: !exists,
    message: !exists ? "Выкройка добавлена в избранное" : "Выкройка удалена из избранного",
    wishlist: { total: updated.length, items: updated },
  };
}

/**
 * Удалить выкройку из избранного по ID
 */
export async function removeFromWishlist(patternId: number): Promise<WishlistResponse> {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    const updated = removeFromGuestWishlist(patternId);
    return { total: updated.length, items: updated };
  }

  if (isStaticHosting() && !import.meta.env.VITE_API_URL) {
    const current = getFallbackWishlist(user.id);
    const updated = current.items.filter((it) => it.id !== patternId);
    setFallbackWishlist(updated, user.id);
    return { total: updated.length, items: updated };
  }

  try {
    const response = await fetch(`${API_BASE}/api/wishlist/${patternId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 405 || !response.ok) {
      const current = getFallbackWishlist(user.id);
      const updated = current.items.filter((it) => it.id !== patternId);
      setFallbackWishlist(updated, user.id);
      return { total: updated.length, items: updated };
    }

    const data: { wishlist: WishlistResponse } = await response.json();
    return {
      total: data.wishlist.total,
      items: data.wishlist.items.map((it) => ({
        ...it,
        image: normalizePatternImage(it.image),
      })),
    };
  } catch {
    const current = getFallbackWishlist(user.id);
    const updated = current.items.filter((it) => it.id !== patternId);
    setFallbackWishlist(updated, user.id);
    return { total: updated.length, items: updated };
  }
}
