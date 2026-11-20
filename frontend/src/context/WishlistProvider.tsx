import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchWishlist,
  toggleWishlist as apiToggleWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
  getGuestWishlist,
  toggleGuestWishlist,
  removeFromGuestWishlist,
  syncGuestWishlistWithDatabase,
  type WishlistPattern,
} from "@/api/wishlist.ts";
import { findCachedPatternById } from "@/api/patterns.ts";
import { getPatternImages } from "@/utils/patternImages.ts";
import { WishlistContext } from "./WishlistContext.ts";
import { useAuth } from "./AuthContext.ts";
import { useNotification } from "./NotificationContext.ts";

export interface WishlistProviderProps {
  children: React.ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();

  const [wishlist, setWishlist] = useState<WishlistPattern[]>(() => {
    return currentUser ? [] : getGuestWishlist();
  });
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    try {
      setIsWishlistLoading(true);
      const data = await fetchWishlist();
      setWishlist(data.items || []);
    } catch (err) {
      console.error("Ошибка загрузки избранного из БД:", err);
    } finally {
      setIsWishlistLoading(false);
    }
  }, []);

  // Синхронизация избранного при изменении состояния авторизации
  useEffect(() => {
    if (!currentUser) return;

    let ignore = false;
    const guestItems = getGuestWishlist();

    if (guestItems.length > 0) {
      syncGuestWishlistWithDatabase(guestItems)
        .then((synced) => {
          if (!ignore) {
            setWishlist(synced.items || []);
            showNotification(
              `Добро пожаловать, ${currentUser.name}! Избранное синхронизировано с вашим аккаунтом.`,
            );
          }
        })
        .catch(() => {
          fetchWishlist().then((data) => {
            if (!ignore) setWishlist(data.items || []);
          });
        });
    } else {
      fetchWishlist()
        .then((data) => {
          if (!ignore) {
            setWishlist(data.items || []);
          }
        })
        .catch((err) => {
          console.error("Ошибка загрузки избранного из БД:", err);
        });
    }

    return () => {
      ignore = true;
    };
  }, [currentUser, showNotification]);

  const wishlistIds = useMemo(() => wishlist.map((it) => it.id), [wishlist]);
  const wishlistIdsSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);

  const isFavorite = useCallback(
    (id: number) => wishlistIdsSet.has(id),
    [wishlistIdsSet],
  );

  const toggleWishlist = useCallback(
    async (patternId: number, customPayload?: Partial<WishlistPattern>) => {
      const cached = findCachedPatternById(patternId);
      const price = customPayload?.price ?? cached?.price ?? 490;
      const numPrice =
        typeof price === "number" ? price : parseInt(String(price), 10) || 490;

      const payload: WishlistPattern = {
        id: patternId,
        title:
          customPayload?.title || cached?.title || `Выкройка #${patternId}`,
        doll: customPayload?.doll || cached?.doll || "Барби",
        price: numPrice,
        tag: customPayload?.tag || "Выкройка",
        image:
          customPayload?.image ||
          cached?.image ||
          getPatternImages(patternId)[0] ||
          "",
        format: customPayload?.format || "PDF (А4 + инструкции)",
      };

      // 1. Для гостя — сохраняем в localStorage
      if (!currentUser) {
        const res = toggleGuestWishlist(payload);
        setWishlist(res.items);
        if (res.inWishlist) {
          showNotification(
            "Выкройка добавлена в избранное. Войдите в аккаунт, чтобы не потерять подборку.",
          );
        } else {
          showNotification("Выкройка удалена из избранного");
        }
        return;
      }

      // 2. Для авторизованного пользователя — сохраняем в БД
      try {
        const res = await apiToggleWishlist(patternId, payload);
        setWishlist(res.wishlist.items);
        showNotification(res.message);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Не удалось обновить избранное";
        showNotification(msg);
      }
    },
    [currentUser, showNotification],
  );

  const removeFromWishlist = useCallback(
    async (patternId: number) => {
      if (!currentUser) {
        const updated = removeFromGuestWishlist(patternId);
        setWishlist(updated);
        showNotification("Выкройка удалена из избранного");
        return;
      }

      try {
        const res = await apiRemoveFromWishlist(patternId);
        setWishlist(res.items);
        showNotification("Выкройка удалена из избранного");
      } catch {
        showNotification("Не удалось удалить выкройку из избранного");
      }
    },
    [currentUser, showNotification],
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        wishlistIds,
        wishlistIdsSet,
        isWishlistLoading,
        isFavorite,
        refreshWishlist,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
