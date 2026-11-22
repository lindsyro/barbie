/**
 * API взаимодействия с избранным (Wishlist) в базе данных и localStorage (гость / офлайн)
 */

import { getStoredToken, getStoredUser } from "./auth.ts";
import { findCachedPatternById, type CatalogPatternItem } from "./patterns.ts";
import { getPatternImages } from "../utils/patternImages.ts";

export interface WishlistResponse {
  total: number;
  items: CatalogPatternItem[];
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
const REMOVED_GUEST_KEY = "goose_guest_removed_wishlist";
const getUserStorageKey = (userId: string) => `goose_wishlist_${userId}`;

function isStaticHosting(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.endsWith("github.io") || window.location.protocol === "file:";
}

/* ==========================================================================
   Универсальные хелперы localStorage
   ========================================================================== */

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/* ==========================================================================
   Обогащение данных выкройки
   ========================================================================== */

export function normalizePatternImage(img: string, patternId?: number): string {
  if (patternId) {
    const autoImgs = getPatternImages(patternId);
    if (autoImgs.length > 0) return autoImgs[0];
  }
  return img || `${BASE}patterns/27/1.png`;
}

export function enrichWishlistItem(
  it: Partial<CatalogPatternItem> & { id: number },
): CatalogPatternItem {
  const cached = findCachedPatternById(it.id);
  if (cached) return cached;

  const autoImgs = getPatternImages(it.id);
  const image = it.image || autoImgs[0] || `${BASE}patterns/27/1.png`;

  return {
    id: it.id,
    title: it.title || `Выкройка #${it.id}`,
    doll: it.doll || "Барби",
    price: it.price || 450,
    image,
    images: it.images?.length ? it.images : autoImgs.length > 0 ? autoImgs : [image],
    dolls: it.dolls?.length ? it.dolls : [],
  };
}

/* ==========================================================================
   Гостевое избранное в localStorage
   ========================================================================== */

export function getGuestWishlist(): CatalogPatternItem[] {
  return readStorage<Array<Partial<CatalogPatternItem> & { id: number }>>(
    GUEST_WISHLIST_KEY,
    [],
  ).map(enrichWishlistItem);
}

export function setGuestWishlist(items: CatalogPatternItem[]): void {
  writeStorage(GUEST_WISHLIST_KEY, items);
}

export function clearGuestWishlist(): void {
  removeStorage(GUEST_WISHLIST_KEY);
}

export function getRemovedGuestWishlist(): number[] {
  return readStorage<number[]>(REMOVED_GUEST_KEY, []);
}

export function clearRemovedGuestWishlist(): void {
  removeStorage(REMOVED_GUEST_KEY);
}

export function toggleGuestWishlist(pattern: CatalogPatternItem): {
  inWishlist: boolean;
  items: CatalogPatternItem[];
} {
  const current = getGuestWishlist();
  const exists = current.some((it) => it.id === pattern.id);
  const removed = new Set(getRemovedGuestWishlist());

  let updated: CatalogPatternItem[];
  if (exists) {
    updated = current.filter((it) => it.id !== pattern.id);
    removed.add(pattern.id);
  } else {
    updated = [enrichWishlistItem(pattern), ...current];
    removed.delete(pattern.id);
  }

  setGuestWishlist(updated);
  writeStorage(REMOVED_GUEST_KEY, Array.from(removed));
  return { inWishlist: !exists, items: updated };
}

export function removeFromGuestWishlist(patternId: number): CatalogPatternItem[] {
  const current = getGuestWishlist();
  const updated = current.filter((it) => it.id !== patternId);
  setGuestWishlist(updated);

  const removed = new Set(getRemovedGuestWishlist());
  removed.add(patternId);
  writeStorage(REMOVED_GUEST_KEY, Array.from(removed));

  return updated;
}

/* ==========================================================================
   Резервное (офлайн/статическое) хранилище авторизованного пользователя
   ========================================================================== */

function getFallbackWishlist(userId?: string): WishlistResponse {
  if (!userId) {
    const items = getGuestWishlist();
    return { total: items.length, items };
  }
  const items = readStorage<Array<Partial<CatalogPatternItem> & { id: number }>>(
    getUserStorageKey(userId),
    [],
  ).map(enrichWishlistItem);
  return { total: items.length, items };
}

function setFallbackWishlist(items: CatalogPatternItem[], userId: string): void {
  writeStorage(getUserStorageKey(userId), items);
}

function mergeWishlists(
  existing: CatalogPatternItem[],
  incoming: CatalogPatternItem[],
  removedIds: number[],
): CatalogPatternItem[] {
  const removedSet = new Set(removedIds);
  const filteredExisting = existing.filter((it) => !removedSet.has(it.id));
  const seenIds = new Set(filteredExisting.map((it) => it.id));

  const merged = [...filteredExisting];
  for (const item of incoming) {
    if (!seenIds.has(item.id) && !removedSet.has(item.id)) {
      merged.push(item);
      seenIds.add(item.id);
    }
  }
  return merged;
}

/* ==========================================================================
   Сетевой уровень API
   ========================================================================== */

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit,
  token: string,
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Получить список избранного текущего пользователя
 */
export async function fetchWishlist(): Promise<WishlistResponse> {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    const guestItems = getGuestWishlist();
    return { total: guestItems.length, items: guestItems };
  }

  if (isStaticHosting() && !API_BASE) {
    return getFallbackWishlist(user.id);
  }

  try {
    const data = await apiRequest<{ total?: number; items?: Array<{ id: number }> }>(
      "/api/wishlist",
      { method: "GET" },
      token,
    );
    const items = (data.items || []).map(enrichWishlistItem);
    return {
      total: data.total ?? items.length,
      items,
    };
  } catch {
    return getFallbackWishlist(user.id);
  }
}

/**
 * Синхронизировать гостевое избранное с аккаунтом пользователя
 */
export async function syncGuestWishlistWithDatabase(
  guestItems: CatalogPatternItem[],
  removedPatternIds: number[] = getRemovedGuestWishlist(),
): Promise<WishlistResponse> {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    return { total: guestItems.length, items: guestItems };
  }

  const fallbackSync = () => {
    const current = getFallbackWishlist(user.id).items;
    const merged = mergeWishlists(current, guestItems, removedPatternIds);
    setFallbackWishlist(merged, user.id);
    clearGuestWishlist();
    clearRemovedGuestWishlist();
    return { total: merged.length, items: merged };
  };

  if (guestItems.length === 0 && removedPatternIds.length === 0) {
    return fetchWishlist();
  }

  if (isStaticHosting() && !API_BASE) {
    return fallbackSync();
  }

  try {
    const data = await apiRequest<{
      wishlist: { total: number; items: Array<{ id: number }> };
    }>(
      "/api/wishlist/sync",
      {
        method: "POST",
        body: JSON.stringify({
          patternIds: guestItems.map((it) => it.id),
          removedPatternIds,
        }),
      },
      token,
    );
    clearGuestWishlist();
    clearRemovedGuestWishlist();
    const items = data.wishlist.items.map(enrichWishlistItem);
    return { total: data.wishlist.total ?? items.length, items };
  } catch {
    return fallbackSync();
  }
}

/**
 * Переключить состояние выкройки в избранном (добавить / удалить)
 */
export async function toggleWishlist(
  patternId: number,
  patternFallback?: Partial<CatalogPatternItem>,
): Promise<ToggleWishlistResponse> {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    throw new Error("Требуется авторизация");
  }

  const fallbackToggle = () => {
    const current = getFallbackWishlist(user.id).items;
    const exists = current.some((it) => it.id === patternId);
    const updated = exists
      ? current.filter((it) => it.id !== patternId)
      : [enrichWishlistItem({ id: patternId, ...patternFallback }), ...current];

    setFallbackWishlist(updated, user.id);
    return {
      inWishlist: !exists,
      message: !exists ? "Выкройка добавлена в избранное" : "Выкройка удалена из избранного",
      wishlist: { total: updated.length, items: updated },
    };
  };

  if (isStaticHosting() && !API_BASE) {
    return fallbackToggle();
  }

  try {
    const data = await apiRequest<{
      inWishlist: boolean;
      message: string;
      wishlist: { total: number; items: Array<{ id: number }> };
    }>(
      "/api/wishlist/toggle",
      {
        method: "POST",
        body: JSON.stringify({ patternId }),
      },
      token,
    );
    const items = data.wishlist.items.map(enrichWishlistItem);
    return {
      inWishlist: data.inWishlist,
      message: data.message,
      wishlist: {
        total: data.wishlist.total ?? items.length,
        items,
      },
    };
  } catch (err) {
    if (isStaticHosting()) {
      return fallbackToggle();
    }
    throw err;
  }
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

  const fallbackRemove = () => {
    const current = getFallbackWishlist(user.id).items;
    const updated = current.filter((it) => it.id !== patternId);
    setFallbackWishlist(updated, user.id);
    return { total: updated.length, items: updated };
  };

  if (isStaticHosting() && !API_BASE) {
    return fallbackRemove();
  }

  try {
    const data = await apiRequest<{
      wishlist: { total: number; items: Array<{ id: number }> };
    }>(
      `/api/wishlist/${patternId}`,
      { method: "DELETE" },
      token,
    );
    const items = data.wishlist.items.map(enrichWishlistItem);
    return {
      total: data.wishlist.total ?? items.length,
      items,
    };
  } catch {
    return fallbackRemove();
  }
}
