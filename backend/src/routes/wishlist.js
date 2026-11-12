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
      where: { contextId },
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
      where: { contextId },
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
      where: {
        contextId,
        patternId: numId,
      },
    });

    const updated = await prisma.wishlistItem.findMany({
      where: { contextId },
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
