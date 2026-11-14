import { Router } from "express";
import prisma from "../db.js";
import { getContextId } from "../middleware/auth.js";

const router = Router();

function formatWishlist(items) {
  const patternsList = items.map((it) => ({ id: it.patternId, patternId: it.patternId }));
  return {
    total: patternsList.length,
    items: patternsList,
  };
}

/**
 * GET /api/wishlist
 * Список избранного пользователя из PostgreSQL (ID выкроек)
 */
router.get("/", async (req, res, next) => {
  try {
    const contextId = getContextId(req);
    if (!contextId) {
      return res.json({ total: 0, items: [] });
    }

    const items = await prisma.wishlistItem.findMany({
      where: req.user?.id
        ? { OR: [{ userId: req.user.id }, { contextId: req.user.id }] }
        : { contextId },
      orderBy: { addedAt: "desc" },
    });

    return res.json(formatWishlist(items));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/wishlist/toggle
 * Добавить / удалить выкройку из избранного
 */
router.post("/toggle", async (req, res, next) => {
  try {
    const contextId = getContextId(req);
    if (!contextId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Для добавления в избранное необходимо войти в аккаунт",
      });
    }

    const { patternId } = req.body || {};
    const numId = Number(patternId);

    if (!numId || isNaN(numId)) {
      return res.status(400).json({ error: "BadRequest", message: "Некорректный ID выкройки" });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        contextId_patternId: {
          contextId,
          patternId: numId,
        },
      },
    });

    let inWishlist = false;

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
      inWishlist = false;
    } else {
      await prisma.wishlistItem.create({
        data: {
          contextId,
          userId: req.user?.id || null,
          patternId: numId,
        },
      });
      inWishlist = true;
    }

    const updated = await prisma.wishlistItem.findMany({
      where: req.user?.id
        ? { OR: [{ userId: req.user.id }, { contextId: req.user.id }] }
        : { contextId },
      orderBy: { addedAt: "desc" },
    });

    return res.json({
      inWishlist,
      message: inWishlist
        ? `Выкройка #${numId} добавлена в избранное`
        : `Выкройка #${numId} удалена из избранного`,
      wishlist: formatWishlist(updated),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/wishlist/sync
 * Объединение гостевого списка избранного из localStorage с базой данных пользователя
 */
router.post("/sync", async (req, res, next) => {
  try {
    const contextId = getContextId(req);
    if (!contextId || !req.user?.id) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Требуется авторизация для синхронизации избранного",
      });
    }

    const { patternIds = [] } = req.body || {};
    const validIds = Array.isArray(patternIds)
      ? patternIds.map(Number).filter((id) => !isNaN(id) && id > 0)
      : [];

    for (const patternId of validIds) {
      await prisma.wishlistItem.upsert({
        where: {
          contextId_patternId: {
            contextId: req.user.id,
            patternId,
          },
        },
        update: { userId: req.user.id },
        create: {
          contextId: req.user.id,
          userId: req.user.id,
          patternId,
        },
      });
    }

    const updated = await prisma.wishlistItem.findMany({
      where: { OR: [{ userId: req.user.id }, { contextId: req.user.id }] },
      orderBy: { addedAt: "desc" },
    });

    return res.json({
      message: "Избранное синхронизировано",
      wishlist: formatWishlist(updated),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/wishlist/:patternId
 * Удаление выкройки из избранного
 */
router.delete("/:patternId", async (req, res, next) => {
  try {
    const contextId = getContextId(req);
    if (!contextId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Требуется авторизация",
      });
    }

    const numId = Number(req.params.patternId);
    if (!numId || isNaN(numId)) {
      return res.status(400).json({ error: "BadRequest", message: "Некорректный ID выкройки" });
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        patternId: numId,
        OR: [
          { contextId },
          ...(req.user?.id ? [{ userId: req.user.id }, { contextId: req.user.id }] : []),
        ],
      },
    });

    const updated = await prisma.wishlistItem.findMany({
      where: req.user?.id
        ? { OR: [{ userId: req.user.id }, { contextId: req.user.id }] }
        : { contextId },
      orderBy: { addedAt: "desc" },
    });

    return res.json({
      message: "Выкройка удалена из избранного",
      wishlist: formatWishlist(updated),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
