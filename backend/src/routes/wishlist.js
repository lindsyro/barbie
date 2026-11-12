import { Router } from "express";
import prisma from "../db.js";
import { getContextId } from "../middleware/auth.js";

const router = Router();

function formatWishlist(items) {
  const patternsList = items.map((it) => it.pattern).filter(Boolean);
  return {
    total: patternsList.length,
    items: patternsList,
  };
}

/**
 * GET /api/wishlist
 * Список избранного пользователя из PostgreSQL
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
      include: { pattern: true },
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

    const pattern = await prisma.pattern.findUnique({
      where: { id: numId },
    });

    if (!pattern) {
      return res.status(404).json({ error: "NotFound", message: "Выкройка не найдена" });
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
      include: { pattern: true },
      orderBy: { addedAt: "desc" },
    });

    return res.json({
      inWishlist,
      message: inWishlist
        ? `«${pattern.title}» добавлена в избранное`
        : `«${pattern.title}» удалена из избранного`,
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

    if (validIds.length > 0) {
      // Проверяем существующие выкройки
      const existingPatterns = await prisma.pattern.findMany({
        where: { id: { in: validIds } },
        select: { id: true },
      });
      const validPatternIds = existingPatterns.map((p) => p.id);

      for (const patternId of validPatternIds) {
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
    }

    const updated = await prisma.wishlistItem.findMany({
      where: { OR: [{ userId: req.user.id }, { contextId: req.user.id }] },
      include: { pattern: true },
      orderBy: { addedAt: "desc" },
    });

    return res.json({
      message: "Избранное успешно синхронизировано с аккаунтом",
      mergedCount: validIds.length,
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
      return res.status(401).json({ error: "Unauthorized", message: "Требуется авторизация" });
    }

    const numId = Number(req.params.patternId);

    await prisma.wishlistItem.deleteMany({
      where: req.user?.id
        ? {
            patternId: numId,
            OR: [{ userId: req.user.id }, { contextId: req.user.id }],
          }
        : {
            contextId,
            patternId: numId,
          },
    });

    const updated = await prisma.wishlistItem.findMany({
      where: req.user?.id
        ? { OR: [{ userId: req.user.id }, { contextId: req.user.id }] }
        : { contextId },
      include: { pattern: true },
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
