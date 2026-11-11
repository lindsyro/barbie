import { Router } from "express";
import { wishlists, patterns } from "../data/mockData.js";
import { getContextId } from "../middleware/auth.js";

const router = Router();

function getWishlistForContext(contextId) {
  if (!wishlists.has(contextId)) {
    wishlists.set(contextId, new Set());
  }
  return wishlists.get(contextId);
}

function formatWishlist(setOfIds) {
  const ids = Array.from(setOfIds);
  const items = ids
    .map((id) => patterns.find((p) => p.id === id))
    .filter(Boolean);

  return {
    total: items.length,
    items,
  };
}

/**
 * GET /api/wishlist
 * Список избранных выкроек пользователя
 */
router.get("/", (req, res) => {
  const contextId = getContextId(req);
  if (!contextId) {
    return res.json({ total: 0, items: [] });
  }

  const set = getWishlistForContext(contextId);
  return res.json(formatWishlist(set));
});

/**
 * POST /api/wishlist/toggle
 * Переключение состояния избранного (добавить / убрать)
 * Body: { patternId }
 */
router.post("/toggle", (req, res) => {
  const contextId = getContextId(req);
  if (!contextId) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Для добавления в избранное необходимо войти в аккаунт",
    });
  }

  const { patternId } = req.body || {};
  const numId = Number(patternId);

  const pattern = patterns.find((p) => p.id === numId);
  if (!pattern) {
    return res.status(404).json({ error: "NotFound", message: "Выкройка не найдена" });
  }

  const set = getWishlistForContext(contextId);
  let inWishlist = false;

  if (set.has(numId)) {
    set.delete(numId);
    inWishlist = false;
  } else {
    set.add(numId);
    inWishlist = true;
  }

  return res.json({
    inWishlist,
    message: inWishlist
      ? `«${pattern.title}» добавлена в избранное`
      : `«${pattern.title}» удалена из избранного`,
    wishlist: formatWishlist(set),
  });
});

/**
 * DELETE /api/wishlist/:patternId
 * Удаление выкройки из избранного
 */
router.delete("/:patternId", (req, res) => {
  const contextId = getContextId(req);
  if (!contextId) {
    return res.status(401).json({ error: "Unauthorized", message: "Требуется авторизация" });
  }

  const numId = Number(req.params.patternId);
  const set = getWishlistForContext(contextId);
  set.delete(numId);

  return res.json({
    message: "Выкройка удалена из избранного",
    wishlist: formatWishlist(set),
  });
});

export default router;
