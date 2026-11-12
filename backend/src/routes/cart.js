import { Router } from "express";
import prisma from "../db.js";
import { getContextId } from "../middleware/auth.js";

const router = Router();

function formatCart(cartItems) {
  const enrichedItems = cartItems
    .filter((it) => it.pattern)
    .map((it) => ({
      patternId: it.pattern.id,
      title: it.pattern.title,
      doll: it.pattern.doll,
      price: it.pattern.price,
      image: it.pattern.image,
      format: it.pattern.format,
      addedAt: it.addedAt,
    }));

  const totalPrice = enrichedItems.reduce((sum, item) => sum + item.price, 0);

  return {
    itemsCount: enrichedItems.length,
    totalPrice,
    items: enrichedItems,
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
      return res.json({ itemsCount: 0, totalPrice: 0, items: [] });
    }

    const items = await prisma.cartItem.findMany({
      where: { contextId },
      include: { pattern: true },
      orderBy: { addedAt: "asc" },
    });

    return res.json(formatCart(items));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cart
 * Добавление цифровой выкройки в корзину (1 экземпляр)
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

    const pattern = await prisma.pattern.findUnique({
      where: { id: numId },
    });

    if (!pattern) {
      return res.status(404).json({
        error: "NotFound",
        message: "Выкройка не найдена в каталоге",
      });
    }

    // Проверяем, есть ли уже этот цифровой товар в корзине
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
        include: { pattern: true },
        orderBy: { addedAt: "asc" },
      });

      return res.status(200).json({
        alreadyInCart: true,
        message: `Выкройка «${pattern.title}» уже есть в вашей корзине`,
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
      include: { pattern: true },
      orderBy: { addedAt: "asc" },
    });

    return res.status(201).json({
      alreadyInCart: false,
      message: `«${pattern.title}» добавлена в корзину`,
      cart: formatCart(updatedCart),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/cart/:patternId
 * Неприменимо для цифровых выкроек
 */
router.patch("/:patternId", (req, res) => {
  return res.status(400).json({
    error: "NotApplicable",
    message: "Выкройка является цифровым товаром и оформляется в одном экземпляре",
  });
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
      include: { pattern: true },
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
      cart: { itemsCount: 0, totalPrice: 0, items: [] },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
