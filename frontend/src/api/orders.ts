/**
 * API взаимодействия с заказами и купленными выкройками
 */

import { getStoredToken, getStoredUser } from "./auth.ts";

export interface PurchasedPattern {
  id: string;
  patternId: number;
  title: string;
  doll: string;
  price: number;
  format: string;
  downloadUrl: string;
  orderId: string;
  purchasedAt: string;
  image: string;
  tag?: string;
  difficulty?: string;
}

export interface PurchasedPatternsResponse {
  total: number;
  items: PurchasedPattern[];
  ordersCount: number;
}

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "");

const BASE = import.meta.env.BASE_URL;

function isStaticHosting(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.endsWith("github.io") || window.location.protocol === "file:";
}

function normalizePatternImage(img: string): string {
  if (!img) return `${BASE}1.png`;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/")) {
    return `${BASE}${img.slice(1)}`;
  }
  return `${BASE}${img}`;
}

// Демо-данные для пользователя 'user' в статическом режиме/fallback
const FALLBACK_USER_PURCHASED: PurchasedPattern[] = [
  {
    id: "item-user-1",
    patternId: 1,
    title: "Водолазка-боди для Барби",
    doll: "Барби / Made to Move",
    price: 490,
    format: "PDF (А4 + инструкции)",
    downloadUrl: `${BASE}1.png`, // в демо-режиме ссылка на файл
    orderId: "ORD-774102-USER",
    purchasedAt: new Date().toISOString(),
    image: `${BASE}1.png`,
    tag: "Хит продаж",
    difficulty: "Легкий",
  },
];

/**
 * Получить список всех купленных выкроек текущего пользователя
 */
export async function fetchPurchasedPatterns(): Promise<PurchasedPatternsResponse> {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    return { total: 0, items: [], ordersCount: 0 };
  }

  // Если статический хостинг без бэкенда
  if (isStaticHosting() && !import.meta.env.VITE_API_URL) {
    if (user.email === "user@mail.ru" || user.name === "user") {
      return {
        total: FALLBACK_USER_PURCHASED.length,
        items: FALLBACK_USER_PURCHASED,
        ordersCount: 1,
      };
    }
    return { total: 0, items: [], ordersCount: 0 };
  }

  try {
    const response = await fetch(`${API_BASE}/api/orders/purchased`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 405 || !response.ok) {
      if (user.email === "user@mail.ru" || user.name === "user") {
        return {
          total: FALLBACK_USER_PURCHASED.length,
          items: FALLBACK_USER_PURCHASED,
          ordersCount: 1,
        };
      }
      return { total: 0, items: [], ordersCount: 0 };
    }

    const data: PurchasedPatternsResponse = await response.json();
    return {
      total: data.total ?? data.items?.length ?? 0,
      ordersCount: data.ordersCount ?? 0,
      items: (data.items || []).map((it) => ({
        ...it,
        image: normalizePatternImage(it.image),
      })),
    };
  } catch {
    if (user.email === "user@mail.ru" || user.name === "user") {
      return {
        total: FALLBACK_USER_PURCHASED.length,
        items: FALLBACK_USER_PURCHASED,
        ordersCount: 1,
      };
    }
    return { total: 0, items: [], ordersCount: 0 };
  }
}
