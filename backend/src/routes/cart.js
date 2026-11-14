import { Router } from "express";
import prisma from "../db.js";
import { getContextId } from "../middleware/auth.js";

const router = Router();

function formatCart(cartItems) {
  const items = cartItems.map((it) => ({
    patternId: it.patternId,
    id: it.patternId,
    addedAt: it.addedAt,
  }));

  return {
    itemsCount: items.length,
    items,
  };
}

/**
 * GET /api/cart
 * Получение текущей корзины пользователя из PostgreSQL
 */
router.get("/", async (req, res, next) => {
  try {
    const contextId = getContextId(req);
    if (!contextId) {
      return res.json({ itemsCount: 0, items: [] });
    }

    const items = await prisma.cartItem.findMany({
      where: { contextId },
      orderBy: { addedAt: "asc" },
    });

    return res.json(formatCart(items));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cart
 * Добавление ID выкройки в корзину
 */
router.post("/", async (req, res, next) => {
  try {
    const contextId = getContextId(req);
    if (!contextId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Для добавления в корзину требуется авторизация или гостевая сессия",
      });
    }

    const { patternId } = req.body || {};
    const numId = Number(patternId);

    if (!numId || isNaN(numId)) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Некорректный ID выкройки",
      });
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        contextId_patternId: {
          contextId,
          patternId: numId,
        },
      },
    });

    if (existing) {
      const currentCart = await prisma.cartItem.findMany({
        where: { contextId },
        orderBy: { addedAt: "asc" },
      });

      return res.status(200).json({
        alreadyInCart: true,
        message: `Выкройка #${numId} уже есть в вашей корзине`,
        cart: formatCart(currentCart),
      });
    }

    await prisma.cartItem.create({
      data: {
        contextId,
        userId: req.user?.id || null,
        patternId: numId,
      },
    });

    const updatedCart = await prisma.cartItem.findMany({
      where: { contextId },
      orderBy: { addedAt: "asc" },
    });

    return res.status(201).json({
      alreadyInCart: false,
      message: `Выкройка #${numId} добавлена в корзину`,
      cart: formatCart(updatedCart),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cart/:patternId
 * Удаление выкройки из корзины
 */
router.delete("/:patternId", async (req, res, next) => {
  try {
    const contextId = getContextId(req);
    if (!contextId) {
      return res.status(401).json({ error: "Unauthorized", message: "Требуется авторизация" });
    }

    const numId = Number(req.params.patternId);

    await prisma.cartItem.deleteMany({
      where: {
        contextId,
        patternId: numId,
      },
    });

    const updatedCart = await prisma.cartItem.findMany({
      where: { contextId },
      orderBy: { addedAt: "asc" },
    });

    return res.json({
      message: "Товар удален из корзины",
      cart: formatCart(updatedCart),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cart
 * Полная очистка корзины
 */
router.delete("/", async (req, res, next) => {
  try {
    const contextId = getContextId(req);
    if (contextId) {
      await prisma.cartItem.deleteMany({
        where: { contextId },
      });
    }

    return res.json({
      message: "Корзина очищена",
      cart: { itemsCount: 0, items: [] },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
